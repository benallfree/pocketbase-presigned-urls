import { dbg } from './dbg'
import { hs256 } from './hs256'

export const createPresignedUrl = (
  bucket: string,
  path: string,
  accessKey: string,
  secretKey: string,
  endpoint = 's3.amazonaws.com',
  region = 'us-east-1',
  expiresIn = 3600
) => {
  const tryDate = new Date()
  const timestamp = Math.floor(tryDate.getTime() / 1000)
  const datestamp = tryDate.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const date = datestamp.split('T')[0]!

  dbg({ timestamp, datestamp, date })

  // Request details
  const credential = `${accessKey}/${date}/${region}/s3/aws4_request`
  const expires = timestamp + expiresIn

  dbg({ credential, expires })

  // Handle endpoint formatting
  const host = endpoint.includes(bucket) ? endpoint : `${bucket}.${endpoint}`
  dbg({ host })

  // Canonical request elements
  const canonicalUri = `/${path}`.replace(/\/+/g, '/')
  const canonicalQueryString = [
    'X-Amz-Algorithm=AWS4-HMAC-SHA256',
    `X-Amz-Credential=${encodeURIComponent(credential)}`,
    `X-Amz-Date=${datestamp}`,
    `X-Amz-Expires=${expiresIn}`,
    'X-Amz-SignedHeaders=host',
  ]
    .sort()
    .join('&')

  dbg({ canonicalUri, canonicalQueryString })

  // Create canonical request
  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQueryString,
    `host:${host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n')

  dbg(`canonicalRequest`, canonicalRequest)

  // Create string to sign
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    `${datestamp}`,
    `${date}/${region}/s3/aws4_request`,
    $security.sha256(canonicalRequest),
  ].join('\n')

  dbg(`stringToSign`, stringToSign)

  // Calculate signature
  const dateKey = hs256(date, 'AWS4' + secretKey, 'TEXT')
  dbg(`dateKey`, dateKey)

  const dateRegionKey = hs256(region, dateKey)
  dbg(`dateRegionKey`, dateRegionKey)
  const dateRegionServiceKey = hs256('s3', dateRegionKey)
  dbg(`dateRegionServiceKey`, dateRegionServiceKey)
  const signingKey = hs256('aws4_request', dateRegionServiceKey)
  dbg(`signingKey`, signingKey)
  const signature = hs256(stringToSign, signingKey)

  dbg(`signature`, signature)

  // Construct final URL
  const queryParams = canonicalQueryString + `&X-Amz-Signature=${signature}`
  const finalUrl = `https://${host}${path}?${queryParams}`

  dbg(`finalUrl`, finalUrl)

  return finalUrl
}
