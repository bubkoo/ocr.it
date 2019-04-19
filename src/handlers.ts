import { ipcMain, dialog, clipboard, Notification } from 'electron'
import { capture } from './capture'
import { recognize } from './engines'
import { SHOW_RESULT_WINDOW } from './actions'
import {
  persistKeys,
  getStoredValue,
  setLastRecognitionResult,
  getLastRecognitionResult,
} from './persists'

export async function recognizeImage(path: string) {
  return recognize(path).then(
    (result) => {
      const data = { path, result }
      console.log(data)
      setLastRecognitionResult(data)
      ipcMain.emit(SHOW_RESULT_WINDOW)

      if (getStoredValue<boolean>(persistKeys.copyResultToClipboard)) {
        clipboard.writeText(result.join('\n'))
      }

      return data
    },
    (err) => {
      new Notification({
        title: 'Service Error',
        body: err,
        sound: 'Basso',
      }).show()
    })
}

export async function captureAndRecognize() {
  return capture().then(({ path }) => recognizeImage(path))
}

export async function selectFileAndRecognize() {
  return new Promise((resolve) => {
    dialog.showOpenDialog(
      {
        properties: ['openFile', 'createDirectory'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'bmp', 'png', 'gif'] },
        ],
      },
      (paths) => {
        if (paths.length) {
          resolve(paths[0])
        }
      },
    )
  }).then((path: string) => recognizeImage(path))
}

export function showRecognitionResult() {
  const data = getLastRecognitionResult()
  if (data) {
    ipcMain.emit(SHOW_RESULT_WINDOW)
  }
}
