console.log(`pocketbase-presigned-urls`)

const is23 = !$app.dao

console.log(`is23: ${is23}`)
if (is23) {
  onFileDownloadRequest((e) => {
    return require(`pocketbase-presigned-urls/dist/lib`).HandleFileDownloadRequestV23(
      e
    )
  })
} else {
  onFileDownloadRequest((e) => {
    return require(`pocketbase-presigned-urls/dist/lib`).HandleFileDownloadRequestV22(
      e
    )
  })
}

if (is23) {
  routerUse((e) => {
    return require(`pocketbase-presigned-urls/dist/lib`).HandleHeadersV23(e)
  })
} else {
  routerUse((next) => (c) => {
    return require(`pocketbase-presigned-urls/dist/lib`).HandleHeadersV22(
      next,
      c
    )
  })
}
