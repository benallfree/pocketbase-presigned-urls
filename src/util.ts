import type URL from 'url-parse'
import { createPresignedUrl } from './presign'

const mkPolicy = () => {
  const setting = $app.settings()
  return `img-src 'self' data: blob: https://${setting.s3.bucket}.${setting.s3.endpoint}`
}
export const setHeaders = (header: http.Header) => {
  header.set('Content-Security-Policy', mkPolicy())
  header.set('X-PocketHost-S3-Presigned-URL', `true`)
}

export const getSignedUrl = (referer: URL<any>, servedPath: string) => {
  console.log(`referer`, JSON.stringify(referer))
  if (referer.pathname === '/_' || referer.pathname.startsWith(`/_/`)) {
    return
  }

  const setting = $app.settings()
  if (!setting.s3.enabled) {
    return null
  }

  const url = createPresignedUrl(
    setting.s3.bucket,
    servedPath,
    setting.s3.accessKey,
    setting.s3.secret,
    setting.s3.endpoint,
    setting.s3.region
  )

  return url
}
