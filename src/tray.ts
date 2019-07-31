import * as path from 'path'
import { ipcMain, systemPreferences, Tray, Menu, nativeImage, shell } from 'electron'
import { config } from './config'
import { requestIndicator } from './indicator/main'
import {
  IMAGE_EXTENSIONS,
  captureAndRecognize,
  cacheFileAndRecognize,
  selectFileAndRecognize,
} from './handlers'
import {
  RECIGNIZE_STARTED,
  RECIGNIZE_FINISHED,
  RESPONSE_PROGRESS_INDICATOR,
  SHORTCUTS_CHANGED,
  RESULT_WINDOW_PREPARE_SHOW,
  PREFERENCES_WINDOW_SHOW,
  SERVICE_CONFIG_CHANGED,
  HISTORY_WINDOW_SHOW,
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
          ipcMain.emit(RESULT_WINDOW_PREPARE_SHOW)
        },
      })
    }

    const baiduAuthInfo = getBaiduAuthInfo()
    const tencentAuthInfo = getTencentAuthInfo()
    const googleAPIKey = getGoogleAPIKey()
    const recognitionEngine = getRecognitionEngine()

    items.push(
      {
        label: 'Recognition History',
        accelerator: 'H',
        click: () => {
          ipcMain.emit(HISTORY_WINDOW_SHOW)
        },
      },
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
          ipcMain.emit(PREFERENCES_WINDOW_SHOW)
        },
      },
      {
        label: 'Github...',
        click: () => {
          shell.openExternal('https://github.com/bubkoo/ocr.it')
        },
      },
      {
        label: 'Feedback...',
        click: () => {
          shell.openExternal('https://github.com/bubkoo/ocr.it/issues/new')
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        role: 'quit',
        accelerator: 'Cmd+Q',
      },
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

  export function updateIndicator(dataurl: string) {
    const img = nativeImage.createFromDataURL(dataurl)
    tray.setImage(img.resize({ width: 22, height: 22, quality: 'best' }))
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
        if (IMAGE_EXTENSIONS.includes(ext)) {
          cacheFileAndRecognize(file)
        }
      }
    })
  }
}

let recognizing = false

ipcMain.on(RECIGNIZE_STARTED, (data: any) => {
  const startTime = new Date()
  const totalTime = data.totalTime as number

  let elapsed = 1
  recognizing = true

  const tick = () => {
    if (elapsed < totalTime && recognizing) {
      requestIndicator(100 * elapsed / totalTime)
      setTimeout(
        () => {
          elapsed = new Date().getTime() - startTime.getTime()
          tick()
        },
        16,
      )
    }
  }

  tick()
})

ipcMain.on(RECIGNIZE_FINISHED, () => {
  recognizing = false
  Private.updateTrayIcon()
})

ipcMain.on(RESPONSE_PROGRESS_INDICATOR, (e: any, data: any) => {
  if (recognizing) {
    Private.updateIndicator(data.image as string)
  }
})

ipcMain.on(RESULT_WINDOW_PREPARE_SHOW, () => {
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
