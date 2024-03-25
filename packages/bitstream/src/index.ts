//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export function encoder(outBits: number, out: (value: number) => void) {
  let word: number = 0
  let bit: number = 0

  return {
    writeUInt(value: number, bits: number) {
      if (value < 0) throw new Error('Value must be non-negative')
      if (bits < 0 || bits > outBits) throw new Error('Invalid number of bits')

      for (let fit = outBits - bit; bits > fit; fit = outBits - bit) {
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

export function numberOfBits(num: number): number {
  const i = Math.ceil(num)
  if (i === 0) return 1
  return Math.floor(Math.log2(i)) + 1
}
