import { app, ipcMain, BrowserWindow } from 'electron'
import { getHtmlPath } from '../window-manager'
import {
  SHOW_PREFERENCES_WINDOW,
} from '../actions'

let window: BrowserWindow

function createWindow() {
  window = new BrowserWindow({
    minimizable: false,
    maximizable: false,
    resizable: false,
    show: false,
    title: 'Preferences',
    width: 320,
    height: 240,
    webPreferences: {
      nodeIntegration: false,
    },
  })

  window.loadURL(getHtmlPath('preferences'))

  window.once('ready-to-show', () => {
    window.show()
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
