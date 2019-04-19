import tencentcloud from 'tencentcloud-sdk-nodejs'
import { toBase64 } from '../utils'
import { config } from '../config'

export async function recognize(imagePath: string): Promise<string[]> {
  const imageBase64 = await toBase64(imagePath)
  const { secretId, secretKey } = config.tencentAuthInfo
  const { Credential, ClientProfile, HttpProfile } = tencentcloud.common
  const { Client, Models } = tencentcloud.ocr.v20181119

  const credential = new Credential(secretId, secretKey)
  const httpProfile = new HttpProfile()
  const clientProfile = new ClientProfile()

  httpProfile.endpoint = 'ocr.tencentcloudapi.com'
  clientProfile.httpProfile = httpProfile

  const req = new Models.GeneralFastOCRRequest()
  const client = new Client(credential, 'ap-guangzhou', clientProfile)
  const params = JSON.stringify({ ImageBase64: imageBase64 })

  req.from_json_string(params)

  return new Promise((resolve, reject) => {
    client.GeneralFastOCR(req, (err: any, response: any) => {
      if (err) {
        reject(err)
      } else {
        const ret = JSON.parse(response.to_json_string())
        const lines = ret.TextDetections.map((item: any) => item.DetectedText)
        resolve(lines)
      }
    })
  })
}
