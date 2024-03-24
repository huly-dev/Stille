//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { Buffer } from 'node:buffer'

export function encoder(maxBits: number, out: (value: number) => void) {
  let word: number = 0
  let bit: number = 0

  return {
    writeUInt(value: number, bits: number) {
      if (value < 0) throw new Error('Value must be non-negative')
      if (bits < 0 || bits > maxBits) throw new Error('Invalid number of bits')

      for (let fit = maxBits - bit; bits > fit; fit = maxBits - bit) {
        console.log('bit', bit, 'fit', fit, 'bits', bits)
        const toFit = value & ((1 << fit) - 1)
        word |= toFit << bit
        value >>>= fit
        bit += fit
        bits -= fit
        out(word)
        bit = word = 0
      }
      word |= value << bit
      bit += bits
    },
    flush() {
      if (bit > 0) {
        out(word)
        bit = word = 0
      }
    },
  }
}
