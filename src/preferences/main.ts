import { app, ipcMain, BrowserWindow, Event } from 'electron'
import { getHtmlPath } from '../utils'
import {
  SHOW_PREFERENCES_WINDOW,
  PREFERENCES_WINDOW_BLUR,
  PREFERENCES_WINDOW_FOCUS,
  PREFERENCES_WINDOW_UPDATE_SIZE,
} from '../actions'

let window: BrowserWindow

function createWindow() {
  window = new BrowserWindow({
    title: 'Preferences',
    titleBarStyle: 'hidden',
    width: 240,
    height: 200,
    minimizable: false,
    maximizable: false,
    resizable: false,
    show: false,
    frame: false,
  })

  window.loadURL(getHtmlPath('preferences'))

  window.on('focus', () => {
    window.webContents.send(PREFERENCES_WINDOW_FOCUS)
  })

  window.on('blur', () => {
    window.webContents.send(PREFERENCES_WINDOW_BLUR)
  })

  window.once('ready-to-show', () => {
    window.show()
    window.focus()
    app.dock.show()
  })

  window.on('close', (event) => {
    event.preventDefault()
    window.hide()
  })
}

function showWindow() {
  if (!window) {
    createWindow()
  }
  window.show()
  window.focus()
}

ipcMain.on(SHOW_PREFERENCES_WINDOW, () => {
  showWindow()
})

ipcMain.on(PREFERENCES_WINDOW_UPDATE_SIZE, (e: Event, size: { width: number, height: number }) => {
  const { width, height } = size
  window.setSize(width, height)
})
