// refs
// - https://github.com/electron/electron/issues/5439#issuecomment-217762329

import { app, ipcMain, BrowserWindow } from 'electron'
import { getHtmlPath } from '../utils'
import { RECIGNIZE_FINISHED, REQUEST_PROGRESS_INDICATOR } from '../actions'

let window: null | BrowserWindow

function createWindow() {
  window = new BrowserWindow({
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    resizable: false,
    movable: false,
    focusable: false,
    transparent: true,
    frame: false,
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    width: 44,
    height: 44,
    x: -10000,
    y: -10000,
  })

  window.setIgnoreMouseEvents(true) // 点击穿透
  window.loadURL(getHtmlPath('indicator'))
}

function ensureWindow() {
  return new Promise((resolve) => {
    if (window) {
      resolve()
    } else {
      createWindow()
      window!.once('ready-to-show', () => resolve())
    }
  })
}

function closeWindow() {
  if (window) {
    window.close()
    window = null
  }
}

export function requestIndicator(progress: number) {
  ensureWindow().then(() => {
    window!.webContents.send(REQUEST_PROGRESS_INDICATOR, { progress })
  })
}

ipcMain.on(RECIGNIZE_FINISHED, closeWindow)

app.on('before-quit', closeWindow)
