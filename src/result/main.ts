import clamp from 'lodash.clamp'
import { app, ipcMain, BrowserWindow } from 'electron'
import { getHtmlPath } from '../utils'
import { getTray } from '../tray'
import { getResultWindowOptions } from '../persists'
import {
  RESULT_WINDOW_HIDE,
  RESULT_WINDOW_SHOW,
  RESULT_WINDOW_PREPARE_SHOW,
  RESULT_WINDOW_TOGGLE_IMAGE,
  RESULT_WINDOW_TOGGLE_PINNED,
  RESULT_WINDOW_UPDATE,
} from '../actions'

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

  togglePinned()
  window.loadURL(getHtmlPath('result'))
  window.on('blur', hideWindow)
}

function togglePinned() {
  const options = getResultWindowOptions()
  if (options.pinned) {
    window.setAlwaysOnTop(true, 'screen-saver')
  } else {
    window.setAlwaysOnTop(false, 'screen-saver')
  }
}

function toggleImage() {
  const options = getResultWindowOptions()
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
}

function updateWindowPosition({ width, height }: { width: number, height: number }) {
  const tray = getTray()
  const options = getResultWindowOptions()
  const trayBounds = tray.getBounds()

  window.setSize(
    clamp(
      options.showImage ? width * 2 + 64 : Math.round(width + 32),
      options.showImage ? 360 : 180,
      500,
    ),
    clamp(Math.round(height + 56), 80, 300),
    false,
  )

  const windowBounds = window.getBounds()
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  const y = Math.round(trayBounds.y + trayBounds.height)

  window.setPosition(x, y, false)
}

function showWindow() {
  window.show()
  window.focus()
}

function hideWindow() {
  const options = getResultWindowOptions()
  if (!options.pinned && !window.webContents.isDevToolsOpened()) {
    window.hide()
  }
}

app.on('ready', () => {
  createWindow()
})

app.on('before-quit', () => {
  if (window) {
    window.close()
  }
})

ipcMain.on(RESULT_WINDOW_PREPARE_SHOW, () => {
  window.webContents.send(RESULT_WINDOW_UPDATE)
})

ipcMain.on(RESULT_WINDOW_SHOW, (
  e: any,
  size?: { width: number, height: number },
) => {
  if (size) {
    if (size.width === 0 && size.height === 0) {
      window.setOpacity(0)
    } else {
      window.setOpacity(1)
      updateWindowPosition(size)
    }
  }
  showWindow()
})

ipcMain.on(RESULT_WINDOW_HIDE, hideWindow)
ipcMain.on(RESULT_WINDOW_TOGGLE_IMAGE, toggleImage)
ipcMain.on(RESULT_WINDOW_TOGGLE_PINNED, togglePinned)
