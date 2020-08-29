import { ipcMain, BrowserWindow } from 'electron'
import { createBrowserWindow } from '../utils'
import {
  RECIGNIZE_FINISHED,
  HISTORY_WINDOW_SHOW,
  HISTORY_WINDOW_BLUR,
  HISTORY_WINDOW_FOCUS,
  HISTORY_WINDOW_UPDATE,
} from '../actions'

let window: null | BrowserWindow

function createWindow() {
  window = createBrowserWindow('history', {
    title: 'Recogniztion History',
    width: 800,
    height: 480,
  })

  window.on('focus', () => {
    window!.webContents.send(HISTORY_WINDOW_FOCUS)
  })

  window.on('blur', () => {
    window!.webContents.send(HISTORY_WINDOW_BLUR)
  })

  window.on('closed', () => {
    window = null
  })
}

function showAndFocus() {
  window!.show()
  window!.focus()
}

function showWindow() {
  if (!window) {
    createWindow()
    window!.once('ready-to-show', showAndFocus)
  } else {
    showAndFocus()
  }
}

ipcMain.on(HISTORY_WINDOW_SHOW, showWindow)

ipcMain.on(RECIGNIZE_FINISHED, () => {
  if (window) {
    if (window.isVisible()) {
      window.webContents.send(HISTORY_WINDOW_UPDATE)
    }
  }
})
