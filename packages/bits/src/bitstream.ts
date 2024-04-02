//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { BitInStream, BitOutStream, InStream, OutStream } from './types'

const MAX_UINT32 = 0xffffffff

const ones = (pow: number) => (pow === 32 ? MAX_UINT32 : (1 << pow) - 1)
// const concat = (x: number, y: number, length: number) => (x << length) | (y & ones(length))

// const bitBuffer = (value: number, length: number) => {
//   if (value < 0) throw new Error(`bitBuffer: negative value: ${value}`)

//   let uint32 = value
//   let bits = length

//   return {
//     push: (value: number, length: number) => {
//       if (bits + length > 32) throw new Error(`bitValue: too many bits (${bits + length})`)
//       uint32 = concat(uint32, value, length)
//       bits += length
//     },
//     pop: (length: number) => {
//       if (length > bits) throw new Error(`bitValue: invalid number of bits (${length})`)
//       const result = uint32 >>> (bits - length)
//       bits -= length
//       uint32 &= ones(bits)
//       return result
//     },
//     length: () => bits,
//   }
// }

/**
 * Creates an encoder that manages a stream of bits and outputs them in chunks.
 * @param outBits - The number of bits in each output chunk.
 * @param out - A callback function to handle the output of each chunk.
 * @returns Bits encoder with `writeBits` and `flushBits` methods.
 */
export function bitOutputStream(out: OutStream): BitOutStream {
  let buffer = 0
  let bit = 0

  const writeBits = (value: number, length: number) => {
    if (value < 0 || length < 0) throw new Error(`bitOutputStream: negative argument`)
    buffer = (buffer << length) | value
    bit += length

    while (bit >= 8) {
      out.write((buffer >>> (bit - 8)) & 0xff)
      bit -= 8
    }

    buffer = buffer & ones(bit)
  }

  return {
    writeBits,
    write: (value: number) => writeBits(value, 8),
    close: () => {
      if (bit) out.write(buffer & ones(bit))
      out.close()
    },
  }
}

// export const bitToOutStream = (out: OutStream): BitOutStream => {
//   let value = 0
//   let bits = 0

//   return {
//     writeBits(x: number, n: number) {
//       value = concat(value, x, n)
//       bits += n
//       while (bits >= 8) {
//         out.write((value >>> (bits - 8)) & 0xff)
//         bits -= 8
//       }
//       value &= 0xff
//     },
//     write: (x: number) => out.write(x),
//     close: () => {
//       if (bits) out.write(value)
//       out.close()
//     },
//   }
// }

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
