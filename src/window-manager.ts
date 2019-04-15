import * as path from 'path'
import { app, BrowserWindow } from 'electron'

export function getHtmlPath(view: string) {
  const port = process.env.PORT || 3000
  const isDevelopment = process.env.NODE_ENV === 'development'

  return isDevelopment
    ? `http://localhost:${port}/dist/${view}/index.html`
    : `file://${__dirname}/${view}/index.html`
}

let preferenceWin: BrowserWindow | null = null

export function openPreferences(): void {
  if (preferenceWin) {
    return preferenceWin.focus()
  }

  preferenceWin = new BrowserWindow({
    titleBarStyle: 'hiddenInset',
    minimizable: false,
    maximizable: false,
    resizable: false,
    show: false,
  })

  preferenceWin.loadFile(path.join(__dirname, '../index.html'))

  preferenceWin.once('ready-to-show', () => {
    preferenceWin!.show()
    app.dock.show()
  })

  preferenceWin.on('closed', () => {
    preferenceWin = null
    // sublimeTextRender()
  })

  preferenceWin.webContents.on('did-finish-load', () => {
    // $(preferenceWin);
  })
}
