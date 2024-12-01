console.log(`pocketbase-presigned-urls`)

const is23 = !$app.dao

console.log(`is23: ${is23}`)
if (is23) {
  onFileDownloadRequest((e) => {
    return require(`pocketbase-presigned-urls`).HandleFileDownloadRequestV23(e)
  })
} else {
  onFileDownloadRequest((e) => {
    return require(`pocketbase-presigned-urls`).HandleFileDownloadRequestV22(e)
  })
}

if (is23) {
  routerUse((e) => {
    return require(`pocketbase-presigned-urls`).HandleHeadersV23(e)
  })
} else {
  routerUse((next) => (c) => {
    return require(`pocketbase-presigned-urls`).HandleHeadersV22(next, c)
  })
}
