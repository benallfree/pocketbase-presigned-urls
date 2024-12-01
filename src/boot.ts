const is23 = $app.version.startsWith(`0.23`)

if (is23) {
  onFileDownloadRequest((e) => {
    return require(`pocketbase-image-optimizer`).HandleFileDownloadRequestV22(e)
  })
} else {
  onFileDownloadRequest((e) => {
    return require(`pocketbase-image-optimizer`).HandleFileDownloadRequestV23(e)
  })
}

if (is23) {
  routerUse((e) => {
    return require(`pocketbase-image-optimizer`).HandleCspHeaderV23(e)
  })
} else {
  routerUse((next) => (c) => {
    return require(`pocketbase-image-optimizer`).HandleCspHeaderV23(next, c)
  })
}
