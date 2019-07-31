import { app, ipcMain, globalShortcut, Notification } from 'electron'
import { autoUpdater } from 'electron-updater'
import { config } from './config'
import { createTray } from './tray'
import { SHORTCUTS_CHANGED } from './actions'
import { captureAndRecognize, showRecognitionResult } from './handlers'
import {
  persists,
  persistKeys,
  delLastRecognitionResult,
  getGlobalShortcuts,
} from './persists'
import './result/main'
import './history/main'
import './preferences/main'
import './indicator/main'

if (process.env.NODE_ENV === 'development') {
  // https://github.com/sindresorhus/electron-debug
  require('electron-debug')()
}

app.dock.hide()

app.on('ready', () => {
  Private.checkFirstTimerLaunch()
  Private.installExtensions().then(() => {
    createTray()
    Private.registerGlobalShortcuts()
    autoUpdater.checkForUpdatesAndNotify()
  })
})

app.on('will-quit', () => {
  delLastRecognitionResult()
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

module Private {
  export function installExtensions() {
    if (process.env.NODE_ENV === 'development') {
      // https://github.com/MarshallOfSound/electron-devtools-installer
      const installer = require('electron-devtools-installer')

      const extensions = [
        'REACT_DEVELOPER_TOOLS',
        'REDUX_DEVTOOLS',
      ]
      const forceDownload = !!process.env.UPGRADE_EXTENSIONS
      return Promise.all(extensions.map(name => installer.default(installer[name], forceDownload)))
    }

    return Promise.resolve([])
  }

  export function checkFirstTimerLaunch() {
    if (!persists.get(persistKeys.firstRunTimestamp, null)) {
      app.setLoginItemSettings({ openAtLogin: true })

      persists.set(persistKeys.firstRunTimestamp, Date.now())

      persists.set(persistKeys.autoLaunch, true)
      persists.set(persistKeys.copyResultToClipboard, true)
      persists.set(persistKeys.muteScreenshot, false)
    }
  }

  export function registerGlobalShortcuts() {
    const shortcuts = getGlobalShortcuts()
    if (shortcuts.captureScreen && shortcuts.captureScreen.indexOf('+') > 0) {
      globalShortcut.register(shortcuts.captureScreen, captureAndRecognize)
    }

    if (shortcuts.showRecognitionResult && shortcuts.showRecognitionResult.indexOf('+') > 0) {
      globalShortcut.register(shortcuts.showRecognitionResult, showRecognitionResult)
    }
  }

  export function updateGlobalShortcuts() {
    globalShortcut.unregisterAll()
    registerGlobalShortcuts()
  }
}

ipcMain.on(SHORTCUTS_CHANGED, Private.updateGlobalShortcuts)

process.on('uncaughtException', (error) => {
  new Notification({
    title: config.commonErrorMsg,
    body: error.message,
    sound: 'Basso',
  }).show()
})
