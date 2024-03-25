//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export type BitWriteStream = {
  writeBits(value: number, bits: number): void
  flushBits(): void
}

/**
 * Creates an encoder that manages a stream of bits and outputs them in chunks.
 * @param outBits - The number of bits in each output chunk.
 * @param out - A callback function to handle the output of each chunk.
 * @returns Bits encoder with `writeBits` and `flushBits` methods.
 */
export function createBitWriteStream(outBits: number, out: (value: number) => void): BitWriteStream {
  let word = 0
  let bit = 0

  return {
    writeBits(value: number, bits: number) {
      if (value < 0) throw new Error(`encoder: negaive value: ${value}`)
      if (bits < 0 || bits > outBits) throw new Error(`encoder: invalid number of bits (${bits})`)

      while (bits > 0) {
        const fit = outBits - bit
        const toFit = value & ((1 << fit) - 1)
        word |= toFit << bit
        if (bits > fit) {
          out(word)
          bit = word = 0
          value >>>= fit
          bits -= fit
        } else {
          bit += bits
          break
        }
      }
    },

    flushBits() {
      if (bit) out(word)
      bit = word = 0
    },
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
