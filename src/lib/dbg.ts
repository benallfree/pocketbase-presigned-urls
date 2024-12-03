export const dbg = (...args: any[]) => {
  if (!$app.isDev()) return
  const log = [``, `====[PBPU]====`]
  args.forEach((obj) => {
    if (typeof obj === 'object') {
      log.push(...JSON.stringify(obj, null, 2).split('\n'))
    } else {
      log.push(...`${obj}`.split('\n'))
    }
  })
  log.forEach((line) => console.log(line))
}
