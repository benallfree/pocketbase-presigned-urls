import { createPresignedUrl } from './presign'

const mkPolicy = () => {
  const setting = $app.settings()
  return `img-src 'self' data: blob: https://${setting.s3.bucket}.${setting.s3.endpoint}`
}
export const setHeaders = (header: http.Header) => {
  header.set('Content-Security-Policy', mkPolicy())
  header.set('X-PocketHost-S3-Presigned-URL', `true`)
}

export const getSignedUrl = (referer: string, servedPath: string) => {
  const path = extractPathFromReferer(referer)
  console.log(`referer`, JSON.stringify(referer))
  if (path === '/_' || path.startsWith(`/_/`)) {
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

export function extractPathFromReferer(referer: string) {
  if (!referer) return ''

  // Find the start of the path by locating the first single slash after the protocol
  const pathStartIndex = referer.indexOf('/', referer.indexOf('//') + 2)

  if (pathStartIndex === -1) return '/' // If no path is found, return root

  // Extract the path from the referer
  const path = referer.substring(pathStartIndex)

  // Find the end of the path by locating the first occurrence of '?' or '#'
  const pathEndIndex = Math.min(
    path.indexOf('?') !== -1 ? path.indexOf('?') : path.length,
    path.indexOf('#') !== -1 ? path.indexOf('#') : path.length
  )

  return path.substring(0, pathEndIndex)
}
