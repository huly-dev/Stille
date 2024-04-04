//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import {
  numberOfBits,
  type BitInStream,
  type BitOutStream,
  type SymbolInStream,
  type SymbolOutStream,
} from '@huly/bits'
import { abs, add, inside, sub } from './math'
import type { PathSegment } from './svg'
import type { Pt } from './types'

const MAX_ABSOLUTE_BITS = 13
const FREQUENCY_BITS = 5

export const writeRenderBox = (out: BitOutStream, box: Pt) => {
  out.writeBits(box[0], MAX_ABSOLUTE_BITS)
  out.writeBits(box[1], MAX_ABSOLUTE_BITS)
}

export const readRenderBox = (input: BitInStream): Pt => [
  input.readBits(MAX_ABSOLUTE_BITS),
  input.readBits(MAX_ABSOLUTE_BITS),
]

///

export const writeFrequencyTable = (out: BitOutStream, frequencies: number[], log: (message: string) => void) => {
  const maxFreq = Math.max(...frequencies)
  const bitsPerFrequency = numberOfBits(maxFreq)

  log(`frequencies: ${frequencies}, maximum frequency: ${maxFreq}, ${bitsPerFrequency} bits per frequency`)

  out.writeBits(bitsPerFrequency, FREQUENCY_BITS)
  out.writeBits(frequencies.length, MAX_ABSOLUTE_BITS)
  frequencies.forEach((f) => out.writeBits(f, bitsPerFrequency))
}

export const readFrequencyTable = (input: BitInStream, log: (message: string) => void): number[] => {
  const bitsPerFrequency = input.readBits(FREQUENCY_BITS)
  const count = input.readBits(MAX_ABSOLUTE_BITS)
  const frequencies = Array.from({ length: count }, () => input.readBits(bitsPerFrequency))

  log(`frequencies: ${frequencies}, ${bitsPerFrequency} bits per frequency`)
  return frequencies
}

///

const writeSign = (value: number, out: BitOutStream) => out.writeBits(value < 0 ? 1 : 0, 1)

export const initialPtWriter = (box: Pt, out: SymbolOutStream) => (pt: Pt) => {
  if (pt[0] >= -box[0] && pt[0] <= box[0] && pt[1] >= -box[1] && pt[1] <= box[1]) {
    out.writeBits(0, 1) // relative
    out.writeSymbol(Math.abs(pt[0]))
    out.writeSymbol(Math.abs(pt[1]))
  } else {
    out.writeBits(1, 1) // absolute
    out.writeBits(pt[0], MAX_ABSOLUTE_BITS)
    out.writeBits(pt[1], MAX_ABSOLUTE_BITS)
  }
  writeSign(pt[0], out)
  writeSign(pt[1], out)
}

//

export const segmentWriter =
  (min: Pt, box: Pt) =>
  (current: Pt, segment: PathSegment, out: SymbolOutStream): Pt => {
    let initial = segment.initial
    const delta = sub(sub(initial, current), min)

    if (inside(abs(delta), box)) {
      out.writeBits(0, 1) // relative
      out.writeSymbol(Math.abs(delta[0]))
      out.writeSymbol(Math.abs(delta[1]))
    } else {
      out.writeBits(1, 1) // absolute
      out.writeBits(initial[0], MAX_ABSOLUTE_BITS)
      out.writeBits(initial[1], MAX_ABSOLUTE_BITS)
    }
    writeSign(initial[0], out)
    writeSign(initial[1], out)

    segment.lineTo.forEach((pt) => {
      initial = add(initial, pt)
      const p = sub(pt, min)
      out.writeSymbol(p[0])
      out.writeSymbol(p[1])
    })

    if (!segment.closed) throw new Error('support unclosed path segments')

    out.writeSymbol(0)
    out.writeSymbol(0)

    return initial
  }

const readPoint = (input: SymbolInStream): Pt => [input.readSymbol(), input.readSymbol()]

export const segmentReader =
  (min: Pt) =>
  (current: Pt, input: SymbolInStream): { segment: PathSegment; current: Pt } => {
    const abs = input.readBits(1) // relative or absolute
    const initial: Pt =
      abs === 0
        ? add(add([input.readSymbol(), input.readSymbol()], current), min)
        : [input.readBits(MAX_ABSOLUTE_BITS), input.readBits(MAX_ABSOLUTE_BITS)]

    current = initial
    const lineTo = []
    for (let pt = readPoint(input); (pt = readPoint(input)); pt[0] !== 0 && pt[1] !== 0) {
      const p = add(pt, min)
      lineTo.push(p)
      current = add(initial, p)
    }
    return {
      segment: { initial, lineTo, closed: true },
      current,
    }
  }
