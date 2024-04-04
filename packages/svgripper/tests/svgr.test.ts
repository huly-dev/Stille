//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import type { SymbolInStream, SymbolOutStream } from '@huly/bits'
import { segmentReader, segmentWriter } from '../src/svgr'

test('encode Segment', () => {
  let output: number[] = []

  const out: SymbolOutStream = {
    writeSymbol: (symbol: number) => output.push(symbol),
    writeBits: (bits: number) => output.push(bits),
    writeByte: (byte: number) => output.push(byte),
    close: () => {},
  }

  const writer = segmentWriter([-30, -30], [61, 61], out)

  writer([0, 0], {
    initial: [0, 0],
    lineTo: [
      [30, 30],
      [-10, -10],
      [1, 1],
    ],
    closed: true,
  })

  expect(output).toEqual([0, 30, 30, 0, 0, 60, 60, 20, 20, 31, 31, 0, 0])

  output = []

  writer([0, 0], {
    initial: [1000, 500],
    lineTo: [[30, 30]],
    closed: true,
  })

  expect(output).toEqual([1, 1000, 500, 60, 60, 0, 0])
})

test('decode Segment', () => {
  const createInput = (input: number[]): SymbolInStream => ({
    readSymbol: () => input.shift()!,
    readBits: () => input.shift()!,
    readByte: () => input.shift()!,
    available: () => input.length > 0,
    close: () => {},
  })

  const input = [0, 30, 30, 0, 0, 60, 60, 20, 20, 31, 31, 0, 0]

  const reader = segmentReader([-30, -30], createInput(input))
  const segment = reader([0, 0])

  expect(segment.segment).toEqual({
    initial: [0, 0],
    lineTo: [
      [30, 30],
      [-10, -10],
      [1, 1],
    ],
    closed: true,
  })

  const input2 = [1, 1000, 500, 60, 60, 0, 0]

  const reader2 = segmentReader([-30, -30], createInput(input2))
  const segment2 = reader2([0, 0])

  expect(segment2.segment).toEqual({
    initial: [1000, 500],
    lineTo: [[30, 30]],
    closed: true,
  })
})
