import crypto from 'crypto'

interface S3SigningOptions {
  accessKey: string
  secretKey: string
  region: string
  bucket: string
  key: string
  expiresIn?: number // in seconds
  host?: string
}

function createS3SignedUrl({
  accessKey,
  secretKey,
  region,
  bucket,
  key,
  expiresIn = 3600,
  host = `${bucket}.s3.${region}.amazonaws.com`,
}: S3SigningOptions): string {
  // Get current timestamp in ISO format
  const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const date = datetime.slice(0, 8)

  // Create signing key
  const getSigningKey = () => {
    const dateKey = crypto
      .createHmac('sha256', 'AWS4' + secretKey)
      .update(date)
      .digest()
    const dateRegionKey = crypto
      .createHmac('sha256', dateKey)
      .update(region)
      .digest()
    const dateRegionServiceKey = crypto
      .createHmac('sha256', dateRegionKey)
      .update('s3')
      .digest()
    return crypto
      .createHmac('sha256', dateRegionServiceKey)
      .update('aws4_request')
      .digest()
  }

  // Prepare canonical request components
  const method = 'GET'
  const canonicalUri = `/${key}`
  const queryParams = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKey}/${date}/${region}/s3/aws4_request`,
    'X-Amz-Date': datetime,
    'X-Amz-Expires': expiresIn.toString(),
    'X-Amz-SignedHeaders': 'host',
  })

  const canonicalHeaders = `host:${host}\n`
  const signedHeaders = 'host'
  const payloadHash = crypto.createHash('sha256').update('').digest('hex')

  // Create canonical request
  const canonicalRequest = [
    method,
    canonicalUri,
    queryParams.toString(),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  // Create string to sign
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetime,
    `${date}/${region}/s3/aws4_request`,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n')

  // Calculate signature
  const signature = crypto
    .createHmac('sha256', getSigningKey())
    .update(stringToSign)
    .digest('hex')

  // Construct final URL
  queryParams.append('X-Amz-Signature', signature)
  return `https://${bucket}.${host}${canonicalUri}?${queryParams.toString()}`
}

// Example usage:
const signedUrl = createS3SignedUrl({
  accessKey: 'CgOHqsC6peRnmeShhLnD',
  secretKey: '3gXn02QsbFUEm0egDQCSrml7Jo0BxrJFb9KCE9Hm',
  region: 'us-east-1',
  bucket: 'mmgfcrs-signed-url-test',
  key: 'styxe2xc91fmo4u/lwrax54hxepefyd/aleksandra_grzanek_potion_02_x1000_HYMKKY1Tx5.jpg',
  expiresIn: 3600, // 1 hour
  host: 'n2d2.or4.idrivee2-64.com',
})

console.log(signedUrl)
