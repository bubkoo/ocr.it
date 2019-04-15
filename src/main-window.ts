import * as path from 'path'
import { app, BrowserWindow } from 'electron'

let quitting = false
let mainWindow: BrowserWindow | null

export function createWindow() {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    resizable: true,
    fullscreenable: true,
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', (e: Electron.Event) => {
    if (quitting) {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    } else {
      mainWindow!.hide()
      mainWindow!.setSkipTaskbar(true)
      e.preventDefault()
    }
  })

  return mainWindow
}

// app.on('before-quit', () => quitting = true)

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
  // mainWindow!.show()
})
