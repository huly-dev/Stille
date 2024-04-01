//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { BitInStream, BitOutStream, InStream, OutStream } from './types'

/**
 * Creates an encoder that manages a stream of bits and outputs them in chunks.
 * @param outBits - The number of bits in each output chunk.
 * @param out - A callback function to handle the output of each chunk.
 * @returns Bits encoder with `writeBits` and `flushBits` methods.
 */
export function bitOutputStream(outBits: number, out: BitOutStream): BitOutStream {
  let word = 0
  let bit = 0

  const writeBits = (value: number, bits: number) => {
    if (value < 0) throw new Error(`encoder: negative value: ${value}`)
    if (bits < 0 || bits > outBits) throw new Error(`encoder: invalid number of bits (${bits})`)

    while (bits > 0) {
      const fit = outBits - bit
      const toFit = value & ((1 << fit) - 1)
      word |= toFit << bit
      if (bits > fit) {
        out.writeBits(word, outBits)
        bit = word = 0
        value >>>= fit
        bits -= fit
      } else {
        bit += bits
        break
      }
    }
  }

  return {
    writeBits,
    write: (value: number) => writeBits(value, 8),
    close: () => {
      if (bit) out.writeBits(word, outBits)
      out.close()
    },
  }
}

export const bitToOutStream = (out: OutStream): BitOutStream => {
  let value = 0
  let bits = 0

  return {
    writeBits(x: number, n: number) {
      value = (value << n) | (x & ((1 << n) - 1))
      bits += n
      while (bits >= 8) {
        out.write(value & 0xff)
        value >>>= 8
        bits -= 8
      }
    },
    write: (x: number) => out.write(x),
    close: () => {
      if (bits) out.write(value)
      out.close()
    },
  }
}

export const singleBitInStream = (input: InStream): BitInStream => {
  let buffer = 0
  let bits = 0

  return {
    available: () => bits > 0 || input.available(),
    readBits: (length: number) => {
      if (length !== 1) throw new Error(`singleBitInStream: only 1 bit supported: ${length}`)
      if (bits === 0) {
        buffer = input.read()
        bits = 8
      }
      return (buffer >>> --bits) & 1
    },
    read: () => {
      throw new Error('singleBitInStream: read not supported, use `readBits` instead')
    },
    close: input.close,
  }
}

const MAX_UINT32 = 0xffffffff

/**
 * Determines the minimum number of bits needed to represent a non-negative integer.
 * @param num - The non-negative integer to represent.
 * @returns The minimum number of bits required to represent the input number.
 */
export function numberOfBits(num: number): number {
  if (num < 0 || num > MAX_UINT32) throw new Error(`numberOfBits: only uint32 supported: ${num}`)
  let bits = 1
  let value = num >>> 0
  while ((value >>>= 1)) ++bits
  return bits
}
