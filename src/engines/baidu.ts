// refs:
// - https://ai.baidu.com/docs#/OCR-API/top

import request from 'request'
import { toBase64 } from './utils'
import { config } from '../config'
import { getBaiduAuthInfo } from '../persists'

export async function recognize(imagePath: string): Promise<string[]> {

  const auth = await getAccessToken()
  const accessToken = auth.access_token
  const imageData = await toBase64(imagePath)
  const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`

  return new Promise((resolve, reject) => {
    request.post(
      url,
      {
        formData: {
          image: imageData,
        },
      },
      (err: any, res: request.Response, body) => {
        try {
          if (err) {
            reject(err)
          } else {
            const ret = JSON.parse(body)
            if (res.statusCode === 200) {
              const lines = (ret.words_result || []).map((item: any) => item.words)
              resolve(lines)
            } else {
              reject(`Recognize failed, ${ret.error_description || ret.error}`)
            }
          }
        } catch (e) {
          reject(config.commonErrorMsg)
        }
      },
    )
  })
}

export async function getAccessToken(): Promise<{
  expires_in: number,
  access_token: string,
  refresh_token: string,
  session_key: string,
  session_secret: string,
}> {
  const authInfo = getBaiduAuthInfo()
  return new Promise((resolve, reject) => {
    request.post(
      'https://aip.baidubce.com/oauth/2.0/token',
      {
        formData: {
          grant_type: 'client_credentials',
          client_id: authInfo.appKey,
          client_secret: authInfo.appSecret,
        },
      },
      (err: any, res: request.Response, body) => {
        try {
          if (err) {
            reject(config.authFailedMsg)
          } else {
            const ret = JSON.parse(body)
            if (res.statusCode === 200) {
              resolve(ret)
            } else {
              reject(`Oauth failed, ${ret.error_description || ret.error}`)
            }
          }
        } catch (e) {
          reject(config.authFailedMsg)
        }
      },
    )
  })
}
