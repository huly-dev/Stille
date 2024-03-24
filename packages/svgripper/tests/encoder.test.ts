//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import { encoder } from '../src/bits'

test('encoder', () => {
  const result: number[] = []
  const e = encoder(8, (value) => {
    result.push(value)
  })
  e.writeUInt(0b101, 3)
  e.writeUInt(0b1101, 4)
  e.writeUInt(0b10101, 5)
  e.flush()
  expect(result).toEqual([0b11101101, 0b1010])
})
