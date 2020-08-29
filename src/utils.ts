import * as fs from 'fs'
import sizeOf from 'image-size'
import {
  nativeTheme,
  BrowserWindow,
  BrowserWindowConstructorOptions,
} from 'electron'

export function createBrowserWindow(
  pageName: string,
  options: BrowserWindowConstructorOptions,
  ignoreTheme?: boolean,
) {
  const window = new BrowserWindow({
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    ...options,
  })

  if (ignoreTheme !== true) {
    const update = () => {
      window.setBackgroundColor(
        nativeTheme.shouldUseDarkColors ? '#3d3c3f' : '#ececec',
      )
    }

    nativeTheme.on('updated', update)

    update()
  }

  window.loadURL(getHtmlPath(pageName))

  return window
}

export async function toBase64(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.exists(imagePath, (exists) => {
      if (exists) {
        fs.readFile(imagePath, (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(Buffer.from(data).toString('base64'))
          }
        })
      }
    })
  })
}

export function toBase64Sync(imagePath: string): string {
  if (fs.existsSync(imagePath)) {
    return fs.readFileSync(imagePath, { encoding: 'base64' })
  }

  return ''
}

export function getImageSize(imagePath: string) {
  if (fs.existsSync(imagePath)) {
    const { width, height } = sizeOf(imagePath)
    return { width, height }
  }
  return { width: 0, height: 0 }
}

export function getHtmlPath(view: string) {
  const port = process.env.PORT || 3000
  const isDevelopment = process.env.NODE_ENV === 'development'

  return isDevelopment
    ? `http://localhost:${port}/dist/${view}/index.html`
    : `file://${__dirname}/${view}/index.html`
}
