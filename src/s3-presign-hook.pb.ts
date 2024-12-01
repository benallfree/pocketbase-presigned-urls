/// <reference types="../../pb_data/types.d.ts" />

import URL from 'url-parse'
import { createPresignedUrl } from './presign'

routerUse((next) => (c) => {
  c.response().header().set(`X-PocketHost-S3-Presigned-URL`, `true`)
  next(c)
})

export const HandleFileDownloadRequest = (
  e: core.FileDownloadRequestEvent,
) => {}

export const HandleFileDownloadRequestV22 = (
  e: core.FileDownloadRequestEvent,
) => {
  const referer = new URL(e.httpContext.request().header.get('referer'))
  console.log(`referer`, JSON.stringify(referer))
  if (referer.pathname === '/_' || referer.pathname.startsWith(`/_/`)) {
    return e.next ? e.next() : null
  }

  const setting = $app.settings()
  if (!setting.s3.enabled) return e.next ? e.next() : null

  const url = createPresignedUrl(
    setting.s3.bucket,
    `/${e.servedPath}`,
    // `/styxe2xc91fmo4u/lwrax54hxepefyd/aleksandra_grzanek_potion_02_x1000_HYMKKY1Tx5.jpg`,
    setting.s3.accessKey,
    setting.s3.secret,
    setting.s3.endpoint,
    setting.s3.region,
  )

  e.httpContext.redirect(302, url)
}

const mkPolicy = () => {
  const setting = $app.settings()
  return `img-src 'self' data: blob: https://${setting.s3.bucket}.${setting.s3.endpoint}`
}

export const HandleCspHeaderV22 = (next: echo.HandlerFunc, c: echo.Context) => {
  c.response().header().set('Content-Security-Policy', mkPolicy())
  next(c)
}

export const HandleCspHeaderV23 = (e: core.RequestEvent) => {
  const setting = $app.settings()
  e.response.header.set('Content-Security-Policy', mkPolicy())
  return e.next()
}
