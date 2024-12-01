const hs256Native = (
  data: string,
  key: string,
  keyFormat: 'HEX' | 'TEXT' = 'HEX',
) => {
  return $security.hs256(
    data,
    keyFormat === 'HEX'
      ? toString(
          new Uint8Array(key.match(/.{2}/g)?.map((v) => parseInt(v, 16)) || []),
        )
      : key,
  )
}
export const hs256 = hs256Native
