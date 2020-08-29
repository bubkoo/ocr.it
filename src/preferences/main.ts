import { app, ipcMain, BrowserWindow, Event } from 'electron'
import { createBrowserWindow } from '../utils'
import {
  PREFERENCES_WINDOW_SHOW,
  PREFERENCES_WINDOW_BLUR,
  PREFERENCES_WINDOW_FOCUS,
  PREFERENCES_WINDOW_UPDATE_SIZE,
} from '../actions'

let window: BrowserWindow
let quiting = false

function createWindow() {
  window = createBrowserWindow('preferences', {
    title: 'Preferences',
    width: 240,
    height: 200,
    minimizable: false,
    maximizable: false,
    resizable: false,
    show: false,
  })

  window.on('focus', () => {
    window.webContents.send(PREFERENCES_WINDOW_FOCUS)
  })

  window.on('blur', () => {
    window.webContents.send(PREFERENCES_WINDOW_BLUR)
  })

  window.once('ready-to-show', () => {
    window.show()
    window.focus()
  })

  window.on('close', (event) => {
    if (!quiting) {
      event.preventDefault()
      window.hide()
    }
  })
}

function showAndFocus() {
  window.show()
  window.focus()
}

function showWindow() {
  if (!window) {
    createWindow()
    // tslint:disable-next-line
    // https://github.com/electron/electron/blob/master/docs/api/browser-window.md#showing-window-gracefully
    window!.once('ready-to-show', showAndFocus)
  } else {
    showAndFocus()
  }
}

app.on('before-quit', () => {
  if (window) {
    quiting = true
    window.close()
  }
})

ipcMain.on(PREFERENCES_WINDOW_SHOW, () => {
  showWindow()
})

ipcMain.on(
  PREFERENCES_WINDOW_UPDATE_SIZE,
  (e: Event, size: { width: number; height: number }) => {
    const { width, height } = size
    window.setSize(width, height)
  },
)
