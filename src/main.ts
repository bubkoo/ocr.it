import { app, globalShortcut } from 'electron'
import { createTray } from './tray'
import { delLastRecognitionResult } from './persists'
import './result/main'
import './preferences/main'

if (process.env.NODE_ENV === 'development') {
  // https://github.com/sindresorhus/electron-debug
  require('electron-debug')()
}

function installExtensions() {
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

app.dock.hide()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  installExtensions().then(() => {
    createTray()
  })
})

app.on('will-quit', () => {
  delLastRecognitionResult()
  globalShortcut.unregisterAll()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
