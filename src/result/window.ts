import clamp from 'lodash.clamp'
import { app, ipcMain, screen, BrowserWindow } from 'electron'
import { getHtmlPath, getImageSize } from '../utils'
import { getTray } from '../tray'
import {
  SHOW_RESULT_WINDOW,
  RESULT_WINDOW_TOGGLE_IMAGE,
  GET_LAST_RECOGNITION_RESULT,
} from '../actions'
import {
  getLastRecognitionResult,
  getRecognitionResultWindowOptions,
} from '../persists'

let window: BrowserWindow

function createWindow() {
  window = new BrowserWindow({
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
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

  pinWindow()

  window.loadURL(getHtmlPath('result'))

  window.on('blur', () => {
    const options = getRecognitionResultWindowOptions()
    if (!options.pinned && !window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

export function pinWindow() {
  const options = getRecognitionResultWindowOptions()
  if (options.pinned) {
    window.setAlwaysOnTop(true, 'screen-saver')
  } else {
    window.setAlwaysOnTop(false, 'screen-saver')
  }
}

export function toggleImage() {
  const options = getRecognitionResultWindowOptions()
  const { x, y, width, height } = window.getBounds()
  const bounds = options.showImage
    ? {
      y,
      height,
      x: x - width,
      width: width * 2,
    }
    : {
      y,
      height,
      width: Math.round(width / 2),
      x: x + (width - Math.round(width / 2)),
    }

  window.setBounds(bounds)
  window.webContents.send(RESULT_WINDOW_TOGGLE_IMAGE)
}

function updateWindowPosition() {
  const options = getRecognitionResultWindowOptions()
  const data = getLastRecognitionResult()
  const { width, height } = getImageSize(data.path)
  const tray = getTray()
  const trayBounds = tray.getBounds()
  const currentDisplay = screen.getAllDisplays().filter(d => d.bounds.y === trayBounds.y)[0]
  const displayBounds = currentDisplay.bounds

  window.setSize(
    clamp(
      options.showImage ? width + 64 : Math.round(width / 2 + 32),
      options.showImage ? 360 : 180,
      Math.round(displayBounds.width * 2 / 3),
    ),
    clamp(Math.round(height / 2 + 56), 120, Math.round(displayBounds.height * 2 / 3)),
    false,
  )

  const windowBounds = window.getBounds()
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  const y = Math.round(trayBounds.y + trayBounds.height)

  window.setPosition(x, y, false)
}

function showAndFocus() {
  updateWindowPosition()
  window.show()
  window.focus()
}

function showWindow() {
  if (!window) {
    createWindow()
    window!.once('ready-to-show', showAndFocus)
  }
  showAndFocus()
}

app.on('before-quit', () => {
  if (window) {
    window.close()
  }
})

ipcMain.on(SHOW_RESULT_WINDOW, () => {
  showWindow()
  window.webContents.send(GET_LAST_RECOGNITION_RESULT)
})
