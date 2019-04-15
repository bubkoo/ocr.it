import pkg from '../package.json'

export const config = {
  appId: pkg.build.appId,
  appName: pkg.productName,
  appDesc: pkg.description,
  appVersion: pkg.version,
  storeEncryptionKey: '1b03b486f78dcf87e886',
  defaultShortcuts: {
    captureScreen: '',
    selectImageFile: '',
  },
  defaultEngine: 'baidu',
  authFailedMsg: 'Oauth failed.',
  commonErrorMsg: 'Something went wrong. Please try again.',
  baiduAuthInfo: {
    appKey: 'FtyZMvvvtsYeXELUeGe5Eblm',
    appSecret: 'SyWVu2X4Q68Nhb0cpqEbfVGbG90gHCKB',
  },
  tencentAuthInfo: {
    secretId: 'AKIDwgcLDvRhjcHEvNEXKwOdfS0JbkebFFuL',
    secretKey: 'Pd2ORFoDhwwgBiz0vSnsjLkwt41B6ybk',
  },
  googleAPIKey: 'AIzaSyD2wITp3ygvVQz3D06xaLHiwWZN1t-ckpc',
}
