import pkg from '../package.json'

export const config = {
  appId: pkg.build.appId,
  appName: pkg.productName,
  appDesc: pkg.description,
  appVersion: pkg.version,
  storeEncryptionKey: '1b03b486f78dcf87e886',
  defaultShortcuts: {
    captureScreen: 'CmdOrCtrl+Shift+C',
    showRecognitionResult: 'CmdOrCtrl+Shift+R',
  },
  defaultEngine: 'baidu',
  authFailedMsg: 'Oauth failed.',
  commonErrorMsg: 'Something went wrong. Please try again.',
  baiduAuthInfo: {
    appKey: 'FtyZMvvvtsYeXELUeGe5Eblm',
    appSecret: 'SyWVu2X4Q68Nhb0cpqEbfVGbG90gHCKB',
  },
  tencentAuthInfo: {
    secretId: '',
    secretKey: '',
  },
  googleAPIKey: '',
}
