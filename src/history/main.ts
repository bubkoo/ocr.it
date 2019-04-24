import { ipcMain, BrowserWindow } from 'electron'
import { getHtmlPath } from '../utils'
import {
  RECIGNIZE_FINISHED,
  HISTORY_WINDOW_SHOW,
  HISTORY_WINDOW_UPDATE,
} from '../actions'

let window: null | BrowserWindow

function createWindow() {
  window = new BrowserWindow({
    title: 'Recogniztion History',
    width: 800,
    height: 600,
  })

  window.loadURL(getHtmlPath('history'))

  window.on('closed', () => {
    window = null
  })
}

function showWindow() {
  if (!window) {
    createWindow()
  }

  window!.show()
  window!.focus()
}

ipcMain.on(HISTORY_WINDOW_SHOW, showWindow)

ipcMain.on(RECIGNIZE_FINISHED, () => {
  if (window) {
    if (window.isVisible()) {
      window.webContents.send(HISTORY_WINDOW_UPDATE)
    }
  }
})
