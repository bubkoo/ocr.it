import * as fs from 'fs'

export async function toBase64(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.exists(file, (exists) => {
      if (exists) {
        fs.readFile(file, (err, data) => {
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
