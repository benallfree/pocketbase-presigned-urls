import { setHeaders } from '../lib/util'

export const HandleHeadersV22 = (next: echo.HandlerFunc, c: echo.Context) => {
  if (!$app.settings().s3.enabled) {
    // dbg('S3 is not enabled')
    return next(c)
  }

  setHeaders(c.response().header())
  next(c)
}
