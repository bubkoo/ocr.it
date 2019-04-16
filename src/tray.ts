import * as path from 'path'
import { ipcMain, Tray, Menu, Notification } from 'electron'
import { config } from './config'
import { capture } from './capture'
import { recognize } from './engines'
import {
  SHOW_RESULT_WINDOW,
  SHOW_PREFERENCES_WINDOW,
} from './actions'
import {
  getBaiduAuthInfo,
  getTencentAuthInfo,
  getGoogleAPIKey,
  getRecognitionEngine,
  setLastRecognitionResult,
} from './persists'

let tray: Tray
let hasRecognitionResult = false

export function getTray() {
  return tray
}

function getContextMenu() {
  const items: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Capture Screen',
      accelerator: 'CmdOrCtrl+Shift+B',
      click: () => {
        capture().then(({ path }) => {
          recognize(path).then((result) => {
            const data = { path, result }
            console.log(data)
            setLastRecognitionResult(data)
            ipcMain.emit(SHOW_RESULT_WINDOW)
            const notify = new Notification({
              title: 'Recognize Succeed',
              body: 'Recognition Result was Copied to Clipboard',
              sound: 'Glass',
            })

            notify.show()
          })
        })
      },
    },
    { label: 'Select Image File', accelerator: 'S' },
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
    { label: 'About oct.it...' },
    { label: 'Check for Updates...' },
    { type: 'separator' },
    { label: 'Quit', role: 'quit', accelerator: 'Cmd+Q' },
  )

  return Menu.buildFromTemplate(items)
}

export function createTray() {
  const iconName = process.platform === 'win32' ? 'tray.png' : 'tray@2x.png'
  const iconPath = path.join(__dirname, '../assets', iconName)
  const contextMenu = getContextMenu()

  tray = new Tray(iconPath)
  tray.setToolTip(config.appDesc)
  tray.setContextMenu(contextMenu)

  return tray
}

ipcMain.on(SHOW_RESULT_WINDOW, () => {
  if (!hasRecognitionResult) {
    hasRecognitionResult = true
    tray.setContextMenu(getContextMenu())
  }
})
