//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import { bitOutputStream, byteArrayInStream, bytesCollector, numberOfBits, singleBitInStream } from '../src/'

test('bitOutputStream', () => {
  const c = bytesCollector()
  const e = bitOutputStream(c)

  e.writeBits(0b1, 1)
  e.writeBits(0b10, 2)
  e.writeBits(0b1010, 4)

  expect(c.result().length).toBe(0)

  e.writeBits(0b11, 2)

  expect(c.result().length).toBe(1)
  expect(c.result()[0]).toBe(0b11010101)

  e.close()

  expect(c.result().length).toBe(2)
  expect(c.result()[1]).toBe(0b10000000)

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

test('singleBitInStream', () => {
  const input: number[] = [0xcd, 0x30]

  const e = singleBitInStream(byteArrayInStream(input))
  expect(e.available()).toBe(true)
  expect(e.readBits(1)).toBe(1)
  expect(e.readBits(1)).toBe(1)
  expect(e.readBits(1)).toBe(0)
  expect(e.readBits(1)).toBe(0)
  expect(e.readBits(1)).toBe(1)
  expect(e.readBits(1)).toBe(1)
  expect(e.readBits(1)).toBe(0)
  expect(e.readBits(1)).toBe(1)

  expect(e.readBits(1)).toBe(0)
  expect(e.readBits(1)).toBe(0)
  expect(e.readBits(1)).toBe(1)
  expect(e.readBits(1)).toBe(1)
  expect(e.readBits(1)).toBe(0)
  expect(e.readBits(1)).toBe(0)
  expect(e.readBits(1)).toBe(0)
  expect(e.readBits(1)).toBe(0)

  expect(e.available()).toBe(false)
})
