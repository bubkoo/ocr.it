import * as fs from 'fs'
import sizeOf from 'image-size'

export async function toBase64(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.exists(imagePath, (exists) => {
      if (exists) {
        fs.readFile(imagePath, (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(Buffer.from(data).toString('base64'))
          }
        })
      }
    })
  })
}

export function toBase64Sync(imagePath: string): string {
  if (fs.existsSync(imagePath)) {
    return fs.readFileSync(imagePath, { encoding: 'base64' })
  }

  return ''
}

export function getImageSize(imagePath: string) {
  if (fs.existsSync(imagePath)) {
    const { width, height } = sizeOf(imagePath)
    return { width, height }
  }
  return { width: 0, height: 0 }
}
