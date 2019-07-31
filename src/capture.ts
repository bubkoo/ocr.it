import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { screen } from 'electron'
import { config } from './config'
import { getStoredValue, persistKeys } from './persists'

export function getFileName(
  prefix: string = 'screenshot',
  ext: string = '.png',
) {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  const fix = (d: number) => d < 10 ? `0${d}` : `${d}`

  return `${prefix}-${year}${fix(month)}${fix(day)}-${fix(hour)}${fix(minute)}${fix(second)}${ext}`
}

export function getFilePath(filename: string) {
  const tmpdir = path.join(os.tmpdir(), config.appId)
  if (!fs.existsSync(tmpdir)) {
    fs.mkdirSync(tmpdir)
  }
  return path.join(tmpdir, filename)
}

export interface CaptureOptions {
  fullscreen?: boolean,
  captureWindow?: boolean,
}

export async function capture(options: CaptureOptions = {}): Promise<{
  name: string,
  path: string,
  globalRect?: number[],
}> {
  const { fullscreen, captureWindow } = options
  const name = getFileName()
  const path = getFilePath(name)
  const mute = getStoredValue<boolean>(persistKeys.muteScreenshot)

  return fullscreen
    ? new Promise((resolve, reject) => {
      const cursorPos = screen.getCursorScreenPoint()
      const display = screen.getDisplayNearestPoint(cursorPos)
      const { x, y, width, height } = display.bounds
      const globalRect = [x, y, width, height]
      const cmd = `screencapture -R ${x},${y},${width},${height} ${mute ? '-x' : ''} ${path}`
      exec(cmd, (err) => {
        if (err) {
          console.error(err)
          return reject(err)
        }
        resolve({ name, path, globalRect })
      })
    }) : captureWindow
      ? new Promise((resolve, reject) => {
        const cmd = `screencapture -W -o ${mute ? '-x' : ''} ${path}`
        exec(cmd, (err) => {
          if (err) {
            console.error(err)
            return reject(err)
          }
          resolve({ name, path })
        })
      })
      : new Promise((resolve, reject) => {
        const cmd = `screencapture -i -o ${mute ? '-x' : ''} ${path}`
        exec(cmd, (err) => {
          if (err) {
            console.error(err)
            return reject(err)
          }
          resolve({ name, path })
        })
      })
}
