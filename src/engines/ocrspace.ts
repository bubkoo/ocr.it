import request from 'request'
import { config } from '../config'
import { toBase64 } from '../utils'
import { getOCRSpaceAPIKey } from '../persists'

// see: https://ocr.space/OCRAPI
export async function recognize(imagePath: string) {
  const imageData = await toBase64(imagePath)
  return new Promise<string[]>((resolve, reject) => {
    request.post(
      'https://api.ocr.space/parse/image',
      {
        formData: {
          base64Image: `data:image/png;base64,${imageData}`,
          apikey: getOCRSpaceAPIKey() || config.ocrSpaceAPIKey,
        },
      },
      (err, res, body) => {
        try {
          if (err) {
            reject(err)
          } else {
            const data = JSON.parse(body)
            if (typeof data === 'string') {
              reject(data)
            } else {
              if (data.IsErroredOnProcessing) {
                reject(`Recognize failed, ${data.ErrorMessage}`)
              } else {
                const result: string[] = []
                data.ParsedResults.forEach(({ ParsedText }: any) => {
                  if (ParsedText) {
                    result.push(ParsedText)
                  }
                })
                resolve(result)
              }
            }
          }
        } catch (e) {
          reject(config.commonErrorMsg)
        }
      },
    )
  })
}
