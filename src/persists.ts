import * as fs from 'fs'
import ElectronStore from 'electron-store'
import { toBase64Sync } from './utils'
import { config } from './config'

export const persists = new ElectronStore({
  encryptionKey: config.storeEncryptionKey,
})

export const persistKeys = {
  autoLaunch: 'autoLunch',
  muteScreenshot: 'muteScreenshot',
  copyResultToClipboard: 'copyResultToClipboard',
  firstRunTimestamp: 'firstRunTimestamp',
  recognitionEngine: 'recognizeEngine',
  globalShortcuts: 'globalShortcuts',

  baiduAuthInfo: 'baiduAuthInfo',
  tencentAuthInfo: 'tencentAuthInfo',
  googleAPIKey: 'googleAPIKey',
  ocrSpaceAPIKey: 'ocrSpaceAPIKey',

  lastRecognitionResult: 'lastRecognitionResult',
  historyRecognitions: 'historyRecognitions',
  averageRecognitionTime: 'averageRecognitionTime',

  recognitionResultWindowOptions: 'recognitionResultWindowOptions',
}

export function getStoredValue<T>(key: string): T {
  return persists.get(key) as T
}

export interface GlobalShortcuts {
  captureScreen: string
  showRecognitionResult: string
}

export function getGlobalShortcuts() {
  return persists.get(
    persistKeys.globalShortcuts,
    config.defaultShortcuts,
  ) as GlobalShortcuts
}

export function setGlobalShortcuts(value: GlobalShortcuts) {
  persists.set(persistKeys.globalShortcuts, value)
}

export type RecognitionEngine = 'baidu' | 'google' | 'tencent' | 'OCRSpace'

export interface BaiduAuthInfo {
  appKey: string
  appSecret: string
}

export function getBaiduAuthInfo(defaultValue?: BaiduAuthInfo): BaiduAuthInfo {
  const ret = persists.get(
    persistKeys.baiduAuthInfo,
    defaultValue || {},
  ) as BaiduAuthInfo
  if (ret.appKey && ret.appSecret) {
    return ret
  }
  return config.baiduAuthInfo
}

export function getBaiduAuthInfoRaw(): BaiduAuthInfo {
  return persists.get(persistKeys.baiduAuthInfo, {}) as BaiduAuthInfo
}

export function setBaiduAuthInfo(value: BaiduAuthInfo): void {
  persists.set(persistKeys.baiduAuthInfo, value)
}

export interface TencentAuthInfo {
  secretId: string
  secretKey: string
}

export function getTencentAuthInfo(
  defaultValue?: TencentAuthInfo,
): TencentAuthInfo {
  return persists.get(
    persistKeys.tencentAuthInfo,
    defaultValue || {},
  ) as TencentAuthInfo
}

export function setTencentAuthInfo(value: TencentAuthInfo): void {
  persists.set(persistKeys.tencentAuthInfo, value)
}

export function getGoogleAPIKey(defaultValue?: string): string {
  return persists.get(persistKeys.googleAPIKey, defaultValue || '') as string
}

export function setGoogleAPIKey(value: string): void {
  return persists.set(persistKeys.googleAPIKey, value)
}

export function getOCRSpaceAPIKey(defaultValue?: string) {
  return persists.get(persistKeys.ocrSpaceAPIKey, defaultValue || '') as string
}

export function setOCRSpaceAPIKey(value: string) {
  return persists.set(persistKeys.ocrSpaceAPIKey, value)
}

export function getRecognitionEngine(): RecognitionEngine {
  const engine = persists.get(
    persistKeys.recognitionEngine,
  ) as RecognitionEngine

  if (engine === 'baidu') {
    const baiduAuthInfo = getBaiduAuthInfo()
    if (baiduAuthInfo.appKey && baiduAuthInfo.appSecret) {
      return engine
    }
  } else if (engine === 'tencent') {
    const tencentAuthInfo = getTencentAuthInfo()
    if (tencentAuthInfo.secretId && tencentAuthInfo.secretKey) {
      return engine
    }
  } else if (engine === 'google') {
    const googleAPIKey = getGoogleAPIKey()
    if (googleAPIKey) {
      return engine
    }
  }

  return 'OCRSpace'
}

export function setRecognizeEngine(
  value: RecognitionEngine,
): RecognitionEngine {
  persists.set(persistKeys.recognitionEngine, value)
  return value
}

export interface RecognitionResult {
  path: string
  result: string[]
}

export function getLastRecognitionResult(): RecognitionResult {
  return persists.get(
    persistKeys.lastRecognitionResult,
    {},
  ) as RecognitionResult
}

export function setLastRecognitionResult(data: RecognitionResult) {
  return persists.set(persistKeys.lastRecognitionResult, data)
}

export function delLastRecognitionResult() {
  persists.delete(persistKeys.lastRecognitionResult)
}

export interface ResultWindowOptions {
  pinned?: boolean
  showImage?: boolean
  continuously?: boolean
}

export function getResultWindowOptions(): ResultWindowOptions {
  return persists.get(
    persistKeys.recognitionResultWindowOptions,
    {},
  ) as ResultWindowOptions
}

export function setResultWindowOptions(options: ResultWindowOptions) {
  persists.set(persistKeys.recognitionResultWindowOptions, options)
}

export interface AverageRecognitionTime {
  baidu: number
  google: number
  tencent: number
}

export function getAverageRecognitionTime() {
  return persists.get(persistKeys.averageRecognitionTime, {
    baidu: 0,
    google: 0,
    tencent: 0,
  }) as AverageRecognitionTime
}

export function setAverageRecognitionTime(value: AverageRecognitionTime) {
  persists.set(persistKeys.averageRecognitionTime, value)
}

export interface HistoryItem extends RecognitionResult {
  base64?: string
  datetime: number
}

export function getHistoryRecognitions(raw?: boolean) {
  const items = (persists.get(persistKeys.historyRecognitions) ||
    []) as HistoryItem[]
  if (raw) {
    return items
  }

  return items
    .map((item) => ({
      ...item,
      base64: toBase64Sync(item.path),
    }))
    .filter((item) => item.path)
}

export function setHistoryRecognitions(items: HistoryItem[]) {
  persists.set(persistKeys.historyRecognitions, items)
}

export function cleanHistoryRecognitions() {
  persists.set(persistKeys.historyRecognitions, [])
}

export function addItemToHistory(data: RecognitionResult) {
  const item: HistoryItem = {
    ...data,
    datetime: new Date().getTime(),
  }
  const items = getHistoryRecognitions(true)
  items.unshift(item)
  setHistoryRecognitions(items)
}

function delHistoryItem(items: HistoryItem[], item: HistoryItem) {
  let index = -1
  items.some((it: HistoryItem, i: number) => {
    if (it.path === item.path) {
      index = i
      if (fs.existsSync(item.path)) {
        fs.unlinkSync(item.path)
      }
      return true
    }
    return false
  })

  if (index >= 0) {
    items.splice(index, 1)
  }
}

export function removeHistoryRecognitionItem(item: HistoryItem) {
  const items = getHistoryRecognitions(true)
  delHistoryItem(items, item)
  setHistoryRecognitions(items)
}

export function removeHistoryRecognitionItems(items: HistoryItem[]) {
  const sotredItems = getHistoryRecognitions(true)
  items.forEach((item) => delHistoryItem(sotredItems, item))
  setHistoryRecognitions(sotredItems)
}
