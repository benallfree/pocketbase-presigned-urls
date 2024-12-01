import crypto from 'node:crypto'

function createPresignedUrl(
  bucket: string,
  path: string,
  accessKey: string,
  secretKey: string,
  endpoint = 's3.amazonaws.com',
  region = 'us-east-1',
  expiresIn = 3600,
) {
  const tryDate = new Date('2024-12-01T07:22:57.096Z') // new Date()
  const timestamp = Math.floor(tryDate.getTime() / 1000)
  const datestamp = tryDate.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const date = datestamp.split('T')[0]!

  console.log(timestamp, datestamp, date)

  // Request details
  const credential = `${accessKey}/${date}/${region}/s3/aws4_request`
  const expires = timestamp + expiresIn

  console.log('Credential', credential)

  // Handle endpoint formatting
  const host = endpoint.includes(bucket) ? endpoint : `${bucket}.${endpoint}`
  console.log('Host', host)

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

  console.log('CURI', canonicalUri)
  console.log('CQ', canonicalQueryString)

  // Create canonical request
  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQueryString,
    `host:${host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n')

  console.log(`\n\n========\ncanonicalRequest`, canonicalRequest)

  // Create string to sign
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    `${datestamp}`,
    `${date}/${region}/s3/aws4_request`,
    //sha256(canonicalRequest)
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    //$security.sha256(canonicalRequest)
  ].join('\n')

  console.log(`\n\n========\nstringToSign`, stringToSign)

  // Calculate signature

  // const dateKey = $security.hs256(date, "AWS4" + secretKey);
  // const dateRegionKey = $security.hs256(region, dateKey);
  // const dateRegionServiceKey = $security.hs256("s3", dateRegionKey);
  // const signingKey = $security.hs256("aws4_request", dateRegionServiceKey);
  // const signature = $security.hs256(stringToSign, signingKey);

  const dateKey = crypto
    .createHmac('sha256', 'AWS4' + secretKey)
    .update(date)
    .digest()
  console.log(`\n\n========\ndateKey`, dateKey.toString('hex'))
  const dateRegionKey = crypto
    .createHmac('sha256', dateKey)
    .update(region)
    .digest()
  console.log(`\n\n========\ndateRegionKey`, dateRegionKey.toString('hex'))
  const dateRegionServiceKey = crypto
    .createHmac('sha256', dateRegionKey)
    .update('s3')
    .digest()
  console.log(
    `\n\n========\ndateRegionServiceKey`,
    dateRegionServiceKey.toString('hex'),
  )
  const signingKey = crypto
    .createHmac('sha256', dateRegionServiceKey)
    .update('aws4_request')
    .digest()
  console.log(`\n\n========\nsigningKey`, signingKey.toString('hex'))
  const signature = crypto
    .createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex')

  console.log(`\n\n========\nsignature`, signature)

  // Construct final URL
  const queryParams = canonicalQueryString + `&X-Amz-Signature=${signature}`
  return `https://${host}/${path}?${queryParams}`
}

/**
 * Endpoint: n2d2.or4.idrivee2-64.com Bucket: mmgfcrs-signed-url-test Access
 * key: CgOHqsC6peRnmeShhLnD Secret: 3gXn02QsbFUEm0egDQCSrml7Jo0BxrJFb9KCE9Hm
 * Region: us-east-1
 */

console.log(
  createPresignedUrl(
    'mmgfcrs-signed-url-test',
    'styxe2xc91fmo4u/lwrax54hxepefyd/aleksandra_grzanek_potion_02_x1000_HYMKKY1Tx5.jpg',
    'CgOHqsC6peRnmeShhLnD',
    '3gXn02QsbFUEm0egDQCSrml7Jo0BxrJFb9KCE9Hm',
    'n2d2.or4.idrivee2-64.com',
    'us-east-1',
    3600,
  ),
)
