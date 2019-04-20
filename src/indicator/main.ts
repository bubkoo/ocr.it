// refs
// - https://github.com/electron/electron/issues/5439#issuecomment-217762329

import { app, BrowserWindow } from 'electron'
import { getHtmlPath } from '../utils'
import { REQUEST_PROGRESS_INDICATOR } from '../actions'

let window: BrowserWindow

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
    },
    width: 44,
    height: 44,
    x: -100000,
    y: -100000,
  })

  window.setIgnoreMouseEvents(true) // 点击穿透
  window.loadURL(getHtmlPath('indicator'))
}

export function requestIndicator(progress: number) {
  window.webContents.send(REQUEST_PROGRESS_INDICATOR, { progress })
}

app.on('ready', () => {
  createWindow()
})

app.on('before-quit', () => {
  if (window) {
    window.close()
  }
})
