import * as path from 'path'
import { ipcMain, Tray, Menu } from 'electron'
import { config } from './config'
import { capture } from './capture'
import { recognize } from './engines'
import {
  getBaiduAuthInfo,
  getTencentAuthInfo,
  getGoogleAPIKey,
  getRecognitionEngine,
  setLastRecognitionResult,
} from './persists'
import { SHOW_RECOGNITION_RESULT } from './actions'

let tray: Tray

export function getTray() {
  return tray
}

export function createTray() {
  const iconName = process.platform === 'win32' ? 'tray.png' : 'tray@2x.png'
  const iconPath = path.join(__dirname, '../assets', iconName)

  const baiduAuthInfo = getBaiduAuthInfo()
  const tencentAuthInfo = getTencentAuthInfo()
  const googleAPIKey = getGoogleAPIKey()
  const recognizeEngine = getRecognitionEngine()

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Capture Screen',
      accelerator: 'CmdOrCtrl+Shift+B',
      click: () => {
        capture().then(({ path }) => {
          recognize(path).then((result) => {
            const data = { path, result }
            console.log(data)
            setLastRecognitionResult(data)
            ipcMain.emit(SHOW_RECOGNITION_RESULT)
          })
        })
      },
    },
    { label: 'Select Image File', accelerator: 'S' },
    { type: 'separator' },
    {
      label: 'Recognition Result',
      accelerator: 'R',
      click: () => {
        ipcMain.emit(SHOW_RECOGNITION_RESULT)
      },
    },
    {
      label: 'Recognition Service', submenu: [
        {
          label: 'Baidu',
          type: 'radio',
          enabled: !!(baiduAuthInfo.appKey && baiduAuthInfo.appSecret),
          checked: recognizeEngine === 'baidu',
        },
        {
          label: 'Google',
          type: 'radio',
          enabled: !!googleAPIKey,
          checked: recognizeEngine === 'google',
        },
        {
          label: 'Tencent',
          type: 'radio',
          enabled: !!(tencentAuthInfo.secretId && tencentAuthInfo.secretKey),
          checked: recognizeEngine === 'tencent',
        },
      ],
    },
    { type: 'separator' },
    { label: 'Preferences...', accelerator: 'Cmd+,' },
    { label: 'About...' },
    { label: 'Check for Updates...' },
    { type: 'separator' },
    { label: 'Quit', role: 'quit', accelerator: 'Cmd+Q' },
  ])

  tray = new Tray(iconPath)
  tray.setToolTip(config.appDesc)
  tray.setContextMenu(contextMenu)

  return tray
}

export function updateTray() { }
