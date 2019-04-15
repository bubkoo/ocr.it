import { ipcMain, BrowserWindow } from 'electron'
import { getTray } from '../tray'
import { getHtmlPath } from '../window-manager'
import {
  SHOW_RECOGNITION_RESULT,
  GET_LAST_RECOGNITION_RESULT,
} from '../actions'
import {
  getRecognitionResultWindowOptions,
} from '../persists'

let window: BrowserWindow

function createWindow() {
  const options = getRecognitionResultWindowOptions()
  window = new BrowserWindow({
    minimizable: false,
    maximizable: false,

    show: false,
    frame: false,
    fullscreenable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from
      // not running when window is hidden
      backgroundThrottling: false,
    },
  })

  if (options.pinned) {
    window.setAlwaysOnTop(true)
  }

  window.loadURL(getHtmlPath('result'))

  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

function getWindowPosition() {
  const tray = getTray()
  const windowBounds = window.getBounds()
  const trayBounds = tray!.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return { x, y }
}

export function toggleWindow() {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

export function showWindow() {
  if (!window) {
    createWindow()
  }
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

ipcMain.on(SHOW_RECOGNITION_RESULT, () => {
  showWindow()
  window.webContents.send(GET_LAST_RECOGNITION_RESULT)
})
