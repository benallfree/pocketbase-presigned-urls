import { getSignedUrl } from '../lib/util'

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
