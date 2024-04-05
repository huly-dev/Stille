//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { type BitInStream, type BitOutStream, type SymbolInStream, type SymbolOutStream } from '@huly/bits'
import { add, inside, sub } from './math'
import type { Pt } from './types'

const MAX_ABSOLUTE_BITS = 13
export const MAX_COORDINATE = (1 << MAX_ABSOLUTE_BITS) - 1

export const writeAbsolute = (out: BitOutStream, pt: Pt) => {
  out.writeBits(Math.abs(pt[0]), MAX_ABSOLUTE_BITS)
  out.writeBits(pt[0] < 0 ? 1 : 0, 1)
  out.writeBits(Math.abs(pt[1]), MAX_ABSOLUTE_BITS)
  out.writeBits(pt[1] < 0 ? 1 : 0, 1)
}

const read = (input: BitInStream): number => input.readBits(MAX_ABSOLUTE_BITS) * (input.readBits(1) === 0 ? 1 : -1)
export const readAbsolute = (input: BitInStream): Pt => [read(input), read(input)]

export interface PointOutStream extends SymbolOutStream {
  writeRelative(pt: Pt): void
  writeAbsolute(pt: Pt): void
  writeAny(from: Pt, to: Pt): void
}

export interface PointInStream extends SymbolInStream {
  readRelative(): Pt
  readAbsolute(): Pt
  readAny(from: Pt): Pt
}

export const pointOutStream = (min: Pt, max: Pt, out: SymbolOutStream): PointOutStream => {
  const writeRelative = (pt: Pt) => {
    const p = sub(pt, min)
    out.writeSymbol(p[0])
    out.writeSymbol(p[1])
  }
  return {
    ...out,
    writeRelative,
    writeAbsolute: (pt: Pt) => writeAbsolute(out, pt),
    writeAny: (from: Pt, to: Pt) => {
      const delta = sub(to, from)
      if (inside(delta, min, max)) {
        out.writeBits(0, 1)
        writeRelative(delta)
      } else {
        out.writeBits(1, 1)
        writeAbsolute(out, to)
      }
    },
  }
}

export const pointInStream = (min: Pt, input: SymbolInStream): PointInStream => {
  const readRelative = (): Pt => add(min, [input.readSymbol(), input.readSymbol()])
  return {
    ...input,
    readRelative,
    readAbsolute: () => readAbsolute(input),
    readAny: (from: Pt) => (input.readBits(1) ? readAbsolute(input) : add(from, readRelative())),
  }
}
