import { setHeaders } from '../lib/util'

export const HandleHeadersV23 = (e: core.RequestEvent) => {
  if (!$app.settings().s3.enabled) {
    // dbg('S3 is not enabled')
    return e.next()
  }

  setHeaders(e.response.header())
  return e.next()
}
