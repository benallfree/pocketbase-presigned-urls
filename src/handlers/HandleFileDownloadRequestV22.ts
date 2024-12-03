import { getSignedUrl } from '../lib/util'

export const HandleFileDownloadRequestV22 = (e: core.FileDownloadEvent) => {
  const referer = e.httpContext.request().header.get('referer')

  const url = getSignedUrl(referer, `/${e.servedPath}`)

  if (!url) {
    return
  }

  e.httpContext.redirect(302, url)
}
