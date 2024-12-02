export * from './lib'

const isModule = typeof onFileDownloadRequest === 'undefined'
const isBoot = !isModule

if (isBoot) {
  console.log(`pocketbase-presigned-urls`)

  const is23 = !$app.dao

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
