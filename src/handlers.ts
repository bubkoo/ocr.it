import { ipcMain, dialog, clipboard, Notification } from 'electron'
import { capture } from './capture'
import { recognize } from './engines'
import {
  RECIGNIZE_STARTED,
  RECIGNIZE_FINISHED,
  RESULT_WINDOW_HIDE,
  RESULT_WINDOW_PREPARE_SHOW,
} from './actions'
import {
  persistKeys,
  getStoredValue,
  getRecognitionEngine,
  setLastRecognitionResult,
  getLastRecognitionResult,
  getAverageRecognitionTime,
  setAverageRecognitionTime,
  getResultWindowOptions,
  addItemToHistory,
} from './persists'

const queue: string[] = []
let pending = false

function nextRecgnize() {
  pending = false
  if (queue.length) {
    recognizeImage(queue.shift()!)
  }
}

export function recognizeImage(path: string) {
  if (pending) {
    queue.push(path)
    return
  }

  const engine = getRecognitionEngine()
  const perf = getAverageRecognitionTime()
  const prev = (perf as any)[engine] || 0
  const startTime = new Date()

  pending = true
  ipcMain.emit(RECIGNIZE_STARTED, { totalTime: prev })

  recognize(path).then(
    (result) => {
      const options = getResultWindowOptions()
      const data = { path, result }
      if (options.continuously) {
        const old = getLastRecognitionResult()
        const lastResult = (old || {}).result || []
        data.result = [
          ...lastResult,
          '',
          ...data.result,
        ]
      }

      addItemToHistory(data)
      setLastRecognitionResult(data)

      if (getStoredValue<boolean>(persistKeys.copyResultToClipboard)) {
        clipboard.writeText(result.join('\n'))
      }

      const elapsed = new Date().getTime() - startTime.getTime()

      setAverageRecognitionTime({
        ...perf,
        [engine]: prev ? (prev + elapsed) / 2 : elapsed,
      })

      ipcMain.emit(RESULT_WINDOW_PREPARE_SHOW)
      ipcMain.emit(RECIGNIZE_FINISHED)
      nextRecgnize()

      return data
    },
    (err) => {
      ipcMain.emit(RECIGNIZE_FINISHED)
      nextRecgnize()

      new Notification({
        title: 'Service Error',
        body: err,
        sound: 'Basso',
      }).show()
    })
}

export function captureAndRecognize() {
  ipcMain.emit(RESULT_WINDOW_HIDE)
  capture().then(({ path }) => recognizeImage(path))
}

export function selectFileAndRecognize() {
  ipcMain.emit(RESULT_WINDOW_HIDE)
  new Promise((resolve) => {
    dialog.showOpenDialog(
      {
        properties: ['openFile', 'createDirectory'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'bmp', 'png', 'gif'] },
        ],
      },
      (paths) => {
        if (paths && paths.length) {
          resolve(paths[0])
        }
      },
    )
  }).then((path: string) => recognizeImage(path))
}

export function showRecognitionResult() {
  const data = getLastRecognitionResult()
  if (data) {
    ipcMain.emit(RESULT_WINDOW_PREPARE_SHOW)
  }
}
