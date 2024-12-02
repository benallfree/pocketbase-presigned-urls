import { dbg } from './dbg'
import { is23 } from './lib'
import { createPresignedUrl } from './presign'

const mkPolicy = (existingCsp: string) => {
  const setting = $app.settings()
  const newImgSrc = `https://${setting.s3.bucket}.${setting.s3.endpoint}`
  const defaultSources = `'self' data: blob:`

  // If no existing CSP, create new one with default sources and new img-src
  if (!existingCsp) {
    return `img-src ${defaultSources} ${newImgSrc}`
  }

  // Find existing img-src directive
  const imgSrcMatch = existingCsp.match(/img-src ([^;]+)/)

  if (imgSrcMatch) {
    // Get existing sources
    const existingSources = imgSrcMatch[1]
    const missingDefaults = []

    // Check which default sources are missing
    if (!existingSources.includes("'self'")) missingDefaults.push("'self'")
    if (!existingSources.includes('data:')) missingDefaults.push('data:')
    if (!existingSources.includes('blob:')) missingDefaults.push('blob:')

    // Add new source and any missing defaults to existing img-src directive
    const updatedImgSrc =
      `img-src ${existingSources} ${missingDefaults.join(' ')} ${newImgSrc}`.trim()
    return existingCsp.replace(/img-src ([^;]+)/, updatedImgSrc)
  }

  // No img-src directive found, append new one with all sources
  return `${existingCsp}; img-src ${defaultSources} ${newImgSrc}`
}

export const setHeaders = (header: http.Header) => {
  const existingCsp = header.get('Content-Security-Policy') || ''
  const policy = mkPolicy(existingCsp)
  dbg({ policy })
  header.set('Content-Security-Policy', policy)
  header.set('X-PocketHost-S3-Presigned-URL', `true`)
}

const isAdminCompatMode = (path: string) => {
  const force = [`true`, `1`, `yes`, `on`].includes(
    (process.env.PBPU_ADMIN_COMPAT || '').trim().toLowerCase()
  )
  return (!is23 && (path === '/_' || path.startsWith(`/_/`))) || force
}

export const getSignedUrl = (referer: string, servedPath: string) => {
  const path = extractPathFromReferer(referer)
  dbg(`referer`, JSON.stringify(referer))
  if (isAdminCompatMode(path)) {
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
