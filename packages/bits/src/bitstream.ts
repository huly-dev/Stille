//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { ByteInStream, ByteOutStream, InStream, OutStream } from './types'

export interface BitOutStream extends OutStream {
  writeBits(value: number, length: number): void
}

export interface BitInStream extends InStream {
  readBits(length: number): number
}

const MAX_UINT32 = 0xffffffff
const ones = (pow: number) => (pow === 32 ? MAX_UINT32 : (1 << pow) - 1)

/**
 * Creates an encoder that manages a stream of bits and outputs them in chunks.
 * @param outBits - The number of bits in each output chunk.
 * @param out - A callback function to handle the output of each chunk.
 * @returns Bits encoder with `writeBits` and `flushBits` methods.
 */
export function bitOutputStream(out: ByteOutStream): BitOutStream {
  let buffer = 0
  let bit = 0

  return {
    writeBits: (value: number, length: number) => {
      if (value < 0 || length < 0) throw new Error(`bitOutputStream: negative argument`)

      buffer = (buffer << length) | value
      bit += length

      while (bit >= 8) {
        out.writeByte((buffer >>> (bit - 8)) & 0xff)
        bit -= 8
      }

      buffer = buffer & ones(bit)
    },
    close: () => {
      if (bit > 0) out.writeByte(buffer << (8 - bit))
      out.close()
    },
  }
}

export const singleBitInStream = (input: ByteInStream): BitInStream => {
  let buffer = 0
  let bits = 0

  return {
    available: () => bits > 0 || input.available(),
    readBits: (length: number) => {
      if (length !== 1) throw new Error(`singleBitInStream: only 1 bit supported: ${length}`)
      if (bits === 0) {
        buffer = input.readByte()
        bits = 8
      }
      return (buffer >>> --bits) & 1
    },
    close: input.close,
  }
}

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
