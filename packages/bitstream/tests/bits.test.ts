//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'
import { encoder, numberOfBits } from '../src/stream'

test('encoder', () => {
  const output: number[] = []
  const collector = (value: number) => output.push(value)
  const e = encoder(8, collector)

  e.writeBits(0b1, 1)
  e.writeBits(0b10, 2)
  e.writeBits(0b1010, 4)

  expect(output.length).toBe(0)

  e.writeBits(0b11, 2)

  expect(output.length).toBe(1)
  expect(output[0]).toBe(0b11010101)

  e.flushBits()

  expect(output.length).toBe(2)
  expect(output[1]).toBe(0b00000001)
})

test('encoder overflow', () => {
  const collector = () => {}
  const e = encoder(8, collector)

  expect(() => e.writeBits(0b1, 9)).toThrow()
  expect(() => e.writeBits(0b1, -1)).toThrow()
  expect(() => e.writeBits(-1, 5)).toThrow()
  expect(() => e.writeBits(0b1, 4)).not.toThrow()
})

test('numberOfBits returns correct bit lengths', () => {
  expect(numberOfBits(0)).toBe(1)
  expect(numberOfBits(1)).toBe(1)
  expect(numberOfBits(2)).toBe(2)
  expect(numberOfBits(255)).toBe(8)
  expect(numberOfBits(0xffffffff)).toBe(32)
  expect(() => numberOfBits(0x100000000)).toThrow()
  expect(() => numberOfBits(-1)).toThrow()
})
