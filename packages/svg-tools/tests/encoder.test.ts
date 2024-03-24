import { expect, test } from 'bun:test'

import { encoder } from '../src/encoder'

test('encoder', () => {
  const result: number[] = []
  const e = encoder(8, (value) => {
    console.log(value)
    result.push(value)
  })
  e.writeUInt(0b101, 3)
  e.writeUInt(0b1101, 4)
  e.writeUInt(0b10101, 5)
  e.flush()
  expect(result).toEqual([0b11101101, 0b1010])
})
