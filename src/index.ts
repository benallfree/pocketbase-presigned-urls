import { is23, isBoot } from './lib'

export * from './lib'

if (isBoot) {
  console.log(`pocketbase-presigned-urls`)

  console.log(`is23: ${is23}`)
  if (is23) {
    onFileDownloadRequest((e) => {
      return require(
        `${__hooks}/pocketbase-presigned-urls.pb`
      ).HandleFileDownloadRequestV23(e)
    })
  } else {
    onFileDownloadRequest((e) => {
      return require(
        `${__hooks}/pocketbase-presigned-urls.pb`
      ).HandleFileDownloadRequestV22(e)
    })
  }

  if (is23) {
    routerUse((e) => {
      return require(
        `${__hooks}/pocketbase-presigned-urls.pb`
      ).HandleHeadersV23(e)
    })
  } else {
    routerUse((next) => (c) => {
      return require(
        `${__hooks}/pocketbase-presigned-urls.pb`
      ).HandleHeadersV22(next, c)
    })
  }
}
