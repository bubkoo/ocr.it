import ElectronStore from 'electron-store'
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

  lastRecognitionResult: 'lastRecognitionResult',
  averageRecognitionTime: 'averageRecognitionTime',

  recognitionResultWindowOptions: 'recognitionResultWindowOptions',
}

export function getStoredValue<T>(key: string): T {
  return persists.get(key) as T
}

export interface GlobalShortcuts {
  captureScreen: string,
  showRecognitionResult: string,
}

export function getGlobalShortcuts() {
  return persists.get(persistKeys.globalShortcuts, config.defaultShortcuts) as GlobalShortcuts
}

export function setGlobalShortcuts(value: GlobalShortcuts) {
  persists.set(persistKeys.globalShortcuts, value)
}

export type RecognitionEngine = 'baidu' | 'google' | 'tencent' | ''

export interface BaiduAuthInfo {
  appKey: string,
  appSecret: string,
}

export function getBaiduAuthInfo(defaultValue?: BaiduAuthInfo): BaiduAuthInfo {
  const ret = persists.get(persistKeys.baiduAuthInfo, defaultValue || {}) as BaiduAuthInfo
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
  secretId: string,
  secretKey: string,
}

export function getTencentAuthInfo(defaultValue?: TencentAuthInfo): TencentAuthInfo {
  return persists.get(persistKeys.tencentAuthInfo, defaultValue || {})
}

export function setTencentAuthInfo(value: TencentAuthInfo): void {
  persists.set(persistKeys.tencentAuthInfo, value)
}

export function getGoogleAPIKey(defaultValue?: string): string {
  return persists.get(persistKeys.googleAPIKey, defaultValue || '')
}

export function setGoogleAPIKey(value: string): void {
  return persists.set(persistKeys.googleAPIKey, value)
}

export function getRecognitionEngine(): RecognitionEngine {
  const engine = persists.get(persistKeys.recognitionEngine)
  if (engine) {
    return engine as RecognitionEngine
  }

  const baiduAuthInfo = getBaiduAuthInfo()
  if (baiduAuthInfo.appKey && baiduAuthInfo.appSecret) {
    return setRecognizeEngine('baidu')
  }

  const tencentAuthInfo = getTencentAuthInfo()
  if (tencentAuthInfo.secretId && tencentAuthInfo.secretKey) {
    return setRecognizeEngine('tencent')
  }

  const googleAPIKey = getGoogleAPIKey()
  if (googleAPIKey) {
    return setRecognizeEngine('google')
  }

  return ''
}

export function setRecognizeEngine(value: RecognitionEngine): RecognitionEngine {
  persists.set(persistKeys.recognitionEngine, value)
  return value
}

export interface RecognitionResult {
  path: string,
  result: string[],
}

export function getLastRecognitionResult(): RecognitionResult {
  return persists.get(persistKeys.lastRecognitionResult, {}) as RecognitionResult
}

export function setLastRecognitionResult(data: RecognitionResult) {
  return persists.set(persistKeys.lastRecognitionResult, data)
}

export function delLastRecognitionResult() {
  persists.delete(persistKeys.lastRecognitionResult)
}

export interface ResultWindowOptions {
  pinned?: boolean,
  showImage?: boolean,
  continuously?: boolean,
}

export function getResultWindowOptions(): ResultWindowOptions {
  return persists.get(persistKeys.recognitionResultWindowOptions, {})
}

export function setResultWindowOptions(options: ResultWindowOptions) {
  persists.set(persistKeys.recognitionResultWindowOptions, options)
}

export interface AverageRecognitionTime {
  baidu: number,
  google: number,
  tencent: number,
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
