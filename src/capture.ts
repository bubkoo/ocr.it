import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { screen } from 'electron'
import { config } from './config'
import { getStoredBooleanValue, persistKeys } from './persists'

function getScreenshotName() {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  const fix = (d: number) => d < 10 ? `0${d}` : `${d}`

  return `screenshot${year}${fix(month)}${fix(day)}-${fix(hour)}${fix(minute)}${fix(second)}.png`
}

function getScreenshotPath(name: string) {
  const tmpdir = path.join(os.tmpdir(), config.appId)
  if (!fs.existsSync(tmpdir)) {
    fs.mkdirSync(tmpdir)
  }
  return path.join(tmpdir, name)
}

export async function capture(fullscreen?: boolean): Promise<{
  name: string,
  path: string,
  globalRect?: number[],
}> {
  const name = getScreenshotName()
  const path = getScreenshotPath(name)
  const mute = getStoredBooleanValue(persistKeys.muteScreenshotSound)

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
