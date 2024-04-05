//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • bits/basex.test.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { expect, test } from 'bun:test'
import { encodeBaseX } from '../src/basex'

test('encodeBaseX basic encoding', () => {
  const output: number[] = []
  const collector = (value: number) => output.push(value)

  const e = encodeBaseX(64, 3, 4, collector)

  e.writeByte(255)
  e.writeByte(255)
  expect(output.length).toBe(0)

  e.writeByte(255)
  expect(output.length).toBe(4)

  e.flush()
  expect(output.length).toBe(4)
})

test('encodeBaseX error on oversized byteBuffer', () => {
  expect(() => encodeBaseX(64, 4, 2, () => {})).toThrow()
})
