import { recognize as baiduRecognize } from './baidu'
import { recognize as googleRecognize } from './google'
import { recognize as tencentRecognize } from './tencent'
import { getRecognitionEngine } from '../persists'

export { recognize as baiduRecognize } from './baidu'
export { recognize as googleRecognize } from './google'
export { recognize as tencentRecognize } from './tencent'

export async function recognize(imagePath: string): Promise<string[]> {
  const engine = getRecognitionEngine()

  if (engine === 'tencent') {
    return tencentRecognize(imagePath)
  }

  if (engine === 'google') {
    return googleRecognize(imagePath)
  }

  return baiduRecognize(imagePath)
}
