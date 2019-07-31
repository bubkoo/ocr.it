import * as fs from 'fs'
import * as path from 'path'
import { ipcMain, dialog, clipboard, Notification } from 'electron'
import { capture, getFileName, getFilePath } from './capture'
import { recognize } from './engines'
import {
  RECIGNIZE_STARTED,
  RECIGNIZE_FINISHED,
  RESULT_WINDOW_HIDE,
  RESULT_WINDOW_SHOW,
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

function recognizeImage(path: string) {
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
  capture().then(({ path: filepath }) => {
    if (fs.existsSync(filepath)) {
      recognizeImage(filepath)
    }
  })
}

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'bmp', 'png', 'gif']

export function selectFileAndRecognize() {
  ipcMain.emit(RESULT_WINDOW_SHOW, null, { width: 0, height: 0 })
  new Promise((resolve) => {
    dialog.showOpenDialog(
      {
        properties: ['openFile', 'createDirectory'],
        filters: [
          { name: 'Images', extensions: IMAGE_EXTENSIONS },
        ],
      },
      (paths) => {
        if (paths && paths.length) {
          resolve(paths[0])
        }
      },
    )
  }).then(cacheFileAndRecognize)
}

export function cacheFileAndRecognize(sourceFile: string) {
  const prefix = 'file'
  const ext = path.extname(sourceFile)
  const filename = getFileName(prefix, ext)
  const targetFile = getFilePath(filename)
  fs.copyFileSync(sourceFile, targetFile)
  return recognizeImage(targetFile)
}

export function showRecognitionResult() {
  const data = getLastRecognitionResult()
  if (data) {
    ipcMain.emit(RESULT_WINDOW_PREPARE_SHOW)
  }
}
