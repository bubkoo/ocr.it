// refs:
// - https://cloud.google.com/vision/docs/detecting-text#vision-text-detection-protocol

import request from 'request'
import getin from 'lodash.get'
import { toBase64 } from './utils'
import { config } from '../config'

// tslint:disable-next-line
const url = `https://vision.googleapis.com/v1/images:annotate?fields=responses/textAnnotations/description&key=${config.googleAPIKey}`

export async function recognize(imagePath: string): Promise<string[]> {
  const imageData = await toBase64(imagePath)
  return new Promise((resolve, reject) => {
    request.post(
      url,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageData },
              features: [
                { type: 'TEXT_DETECTION' },
              ],
            },
          ],
        }),
      },
      (err, res: request.Response, body) => {
        try {
          console.log(body)
          if (err) {
            reject(err)
          } else {
            const ret = JSON.parse(body)
            if (res.statusCode === 200) {
              const text = getin(ret, 'responses[0].textAnnotations[0].description', '')
              const lines = text.split('\n').filter((str: string) => str.trim().length > 0)
              resolve(lines)
            } else {
              reject(`Recognize failed. ${ret.error.message}`)
            }
          }
        } catch (e) {
          reject(config.commonErrorMsg)
        }
      },
    )
  })
}
