//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • bits/bitstream.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import type { ByteInStream, ByteOutStream } from './types'

export interface BitOutStream extends ByteOutStream {
  writeBits(value: number, length: number): void
}

export interface BitInStream extends ByteInStream {
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
export function bitOutStream(out: ByteOutStream): BitOutStream {
  let buffer = 0
  let bit = 0

  const writeBits = (value: number, length: number) => {
    if (value < 0 || length < 0) throw new Error(`bitOutputStream: negative argument`)

    buffer = (buffer << length) | value
    bit += length

    while (bit >= 8) {
      out.writeByte((buffer >>> (bit - 8)) & 0xff)
      bit -= 8
    }

    buffer = buffer & ones(bit)
  }

  return {
    writeBits,
    writeByte: (value: number) => writeBits(value, 8),
    close: () => {
      if (bit > 0) out.writeByte(buffer << (8 - bit))
      out.close()
    },
  }
}

export const bitInStream = (input: ByteInStream): BitInStream => {
  let buffer = 0
  let bits = 0

  const readBits = (length: number) => {
    while (length > bits) {
      const byte = input.readByte()
      buffer = (buffer << 8) | byte
      bits += 8
    }

    bits -= length
    const value = buffer >>> bits
    buffer = buffer & ones(bits)

    return value
  }

  return {
    available: () => bits > 0 || input.available(),
    readBits,
    readByte: () => readBits(8),
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
