/// <reference types="../v23/pb_data/types.d.ts" />

import { dbg } from './lib/dbg'

export const gt = (a: string, b: string) => {
  const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
  const [bMajor, bMinor, bPatch] = b.split('.').map(Number)
  return (
    aMajor > bMajor ||
    (aMajor === bMajor && aMinor > bMinor) ||
    (aMajor === bMajor && aMinor === bMinor && aPatch > bPatch)
  )
}

export const gte = (a: string, b: string) => {
  const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
  const [bMajor, bMinor, bPatch] = b.split('.').map(Number)
  return (
    aMajor > bMajor ||
    (aMajor === bMajor && aMinor > bMinor) ||
    (aMajor === bMajor && aMinor === bMinor && aPatch >= bPatch)
  )
}

export const lte = (a: string, b: string) => {
  return !gt(a, b)
}

export const lt = (a: string, b: string) => {
  return !gte(a, b)
}

export const _version = $app.rootCmd?.version
if (!_version) {
  throw new Error('version is undefined')
}
export const VERSION = _version
export const [major, minor, patch] = VERSION.split('.').map(Number)
dbg({ VERSION, major, minor, patch })
export const isLegacyApi = !!$app.dao
export const is23Api = !$app.dao
export const isModule = typeof onFileDownloadRequest === 'undefined'
export const isBoot = !isModule

export * from './handlers'

if (isBoot) {
  console.log(`pocketbase-presigned-urls`)

  console.log(`is23Api: ${is23Api}`)
  if (is23Api) {
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

  if (is23Api) {
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
