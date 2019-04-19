import * as path from 'path'
import { ipcMain, systemPreferences, Tray, Menu } from 'electron'
import { config } from './config'
import {
  recognizeImage,
  captureAndRecognize,
  selectFileAndRecognize,
} from './handlers'
import {
  SHORTCUTS_CHANGED,
  SHOW_RESULT_WINDOW,
  SHOW_PREFERENCES_WINDOW,
  SERVICE_CONFIG_CHANGED,
} from './actions'
import {
  getGlobalShortcuts,
  getBaiduAuthInfo,
  getTencentAuthInfo,
  getGoogleAPIKey,
  getRecognitionEngine,
} from './persists'

export function getTray() {
  return Private.tray
}

export function createTray() {
  Private.tray = new Tray(Private.getTrayIcon())
  Private.tray.setToolTip(config.appDesc)
  Private.tray.setContextMenu(Private.getContextMenu())

  Private.initDragAndDrop()

  return Private.tray
}

module Private {
  export let tray: Tray
  export let dragOverWithFile = false
  export let hasRecognitionResult = false

  export function getContextMenu() {
    const shortcuts = getGlobalShortcuts()
    const items: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Capture Screen',
        accelerator: shortcuts.captureScreen,
        click: captureAndRecognize,
      },
      {
        label: 'Select Image File',
        accelerator: 'S',
        click: selectFileAndRecognize,
      },
      { type: 'separator' },
    ]

    if (hasRecognitionResult) {
      items.push({
        label: 'Recognition Result',
        accelerator: 'R',
        click: () => {
          ipcMain.emit(SHOW_RESULT_WINDOW)
        },
      })
    }

    const baiduAuthInfo = getBaiduAuthInfo()
    const tencentAuthInfo = getTencentAuthInfo()
    const googleAPIKey = getGoogleAPIKey()
    const recognitionEngine = getRecognitionEngine()

    items.push(
      {
        label: 'Recognition Service', submenu: [
          {
            label: 'Baidu',
            type: 'radio',
            enabled: !!(baiduAuthInfo.appKey && baiduAuthInfo.appSecret),
            checked: recognitionEngine === 'baidu',
          },
          {
            label: 'Google',
            type: 'radio',
            enabled: !!googleAPIKey,
            checked: recognitionEngine === 'google',
          },
          {
            label: 'Tencent',
            type: 'radio',
            enabled: !!(tencentAuthInfo.secretId && tencentAuthInfo.secretKey),
            checked: recognitionEngine === 'tencent',
          },
        ],
      },
      { type: 'separator' },
      {
        label: 'Preferences...',
        accelerator: 'Cmd+,',
        click: () => {
          ipcMain.emit(SHOW_PREFERENCES_WINDOW)
        },
      },
      { type: 'separator' },
      { label: 'Quit', role: 'quit', accelerator: 'Cmd+Q' },
    )

    return Menu.buildFromTemplate(items)
  }

  export function getTrayIcon() {
    const isWin32 = process.platform === 'win32'
    const isDarkMode = systemPreferences.isDarkMode()
    const name = dragOverWithFile ? 'upload' : 'tray'
    const iconName = `${name}-${isDarkMode ? 'dark' : 'light'}${isWin32 ? '' : '@2x'}.png`
    return path.join(__dirname, '../assets/images', iconName)
  }

  export function updateTrayIcon() {
    tray.setImage(getTrayIcon())
  }

  export function initDragAndDrop() {
    tray.on('drag-enter', () => {
      dragOverWithFile = true
      updateTrayIcon()
    })

    tray.on('drag-leave', () => {
      dragOverWithFile = false
      updateTrayIcon()
    })

    tray.on('drag-end', () => {
      dragOverWithFile = false
      updateTrayIcon()
    })

    tray.on('drop-files', (e, files) => {
      if (files.length) {
        const file = files[0]
        const ext = path.extname(file).toLowerCase().substr(1)
        if (['png', 'gif', 'jpeg', 'jpg', 'bmp'].includes(ext)) {
          recognizeImage(file)
        }
      }
    })
  }
}

ipcMain.on(SHOW_RESULT_WINDOW, () => {
  if (!Private.hasRecognitionResult) {
    Private.hasRecognitionResult = true
    Private.tray.setContextMenu(Private.getContextMenu())
  }
})

ipcMain.on(SHORTCUTS_CHANGED, () => {
  Private.tray.setContextMenu(Private.getContextMenu())
})

ipcMain.on(SERVICE_CONFIG_CHANGED, () => {
  Private.tray.setContextMenu(Private.getContextMenu())
})

systemPreferences.subscribeNotification(
  'AppleInterfaceThemeChangedNotification',
  Private.updateTrayIcon,
)
