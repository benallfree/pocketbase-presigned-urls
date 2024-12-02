/// <reference types="../v23/pb_data/types.d.ts" />

import { getSignedUrl, setHeaders } from './util'

export const is23 = !$app.dao
export const isModule = typeof onFileDownloadRequest === 'undefined'
export const isBoot = !isModule

export const HandleFileDownloadRequestV22 = (e: core.FileDownloadEvent) => {
  const referer = e.httpContext.request().header.get('referer')

  const url = getSignedUrl(referer, `/${e.servedPath}`)

  if (!url) {
    return
  }

  e.httpContext.redirect(302, url)
}

export const HandleFileDownloadRequestV23 = (
  e: core.FileDownloadRequestEvent
) => {
  const referer = e.request?.header.get('referer') || ''

  const url = getSignedUrl(referer, `/${e.servedPath}`)

  if (!url) {
    return e.next()
  }

  e.redirect(302, url)
}

export const HandleHeadersV22 = (next: echo.HandlerFunc, c: echo.Context) => {
  if (!$app.settings().s3.enabled) {
    // dbg('S3 is not enabled')
    return next(c)
  }

  setHeaders(c.response().header())
  next(c)
}

export const HandleHeadersV23 = (e: core.RequestEvent) => {
  if (!$app.settings().s3.enabled) {
    // dbg('S3 is not enabled')
    return e.next()
  }

  setHeaders(e.response.header())
  return e.next()
}
