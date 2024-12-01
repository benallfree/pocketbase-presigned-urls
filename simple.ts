import crypto from 'crypto'

const foo = crypto.createHmac('sha256', 'secret').update('first-value').digest()
console.log(`foo`, foo.toString('hex'))
const bar = crypto.createHmac('sha256', foo).update('second-value').digest()
console.log(`bar`, bar.toString('hex'))
{
  const bar = crypto
    .createHmac('sha256', foo.toString())
    .update('second-value')
    .digest()
  console.log(`bar`, bar.toString('hex'))
}
