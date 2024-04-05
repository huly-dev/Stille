//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • undefined/svgr.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import {
  countFrequencies,
  generateHuffmanCodes,
  huffmanInStream,
  huffmanOutStream,
  numberOfBits,
  type BitInStream,
  type BitOutStream,
} from '@huly/bits'
import { add, bounds, sub } from './math'
import { pointInStream, pointOutStream, readAbsolute, writeAbsolute } from './point'
import { renderSVG, type Svg } from './svg'
import type { Pt } from './types'

const FREQUENCY_BITS = 5
const ALPHABET_BITS = 13

export const writeFrequencyTable = (out: BitOutStream, frequencies: number[]) => {
  const maxFreq = Math.max(...frequencies)
  const bitsPerFrequency = numberOfBits(maxFreq)

  out.writeBits(bitsPerFrequency, FREQUENCY_BITS)
  out.writeBits(frequencies.length, ALPHABET_BITS)

  frequencies.forEach((f) => out.writeBits(f, bitsPerFrequency))
}

export const readFrequencyTable = (input: BitInStream): number[] => {
  const bitsPerFrequency = input.readBits(FREQUENCY_BITS)
  const count = input.readBits(ALPHABET_BITS)
  return Array.from({ length: count }, () => input.readBits(bitsPerFrequency))
}

///

export const encodeSVGR = (svg: Svg, out: BitOutStream, log: (message: string) => void) => {
  const points: Pt[] = []
  renderSVG(svg, {
    renderBox: () => {},
    renderBeginPath: () => {},
    renderBeginSegment: () => {},
    renderLineTo: (pt) => points.push(pt),
    renderEndSegment: () => points.push([0, 0]),
    renderEndPath: () => {},
    renderEndDocument: () => {},
  })

  const { min, max } = bounds(points)
  if (min[0] > 0 || min[1] > 0) throw new Error(`negative min assumption violated: ${min}`)

  const box = sub(max, min)
  const alphabet = Math.max(box[0], box[1]) + 1
  log(`bounding box: min ${min}, max ${max}, box ${box}]`)

  const symbols = points.flatMap((pt) => sub(pt, min))
  log(`converted to ${alphabet} symbols in alphabet`)

  const freq = countFrequencies(symbols, alphabet)
  writeFrequencyTable(out, freq)

  writeAbsolute(out, svg.wh)
  writeAbsolute(out, min)

  const codes = generateHuffmanCodes(freq)
  const huffman = huffmanOutStream(codes, out)

  const pointOut = pointOutStream(min, max, huffman)
  renderSVG(svg, {
    renderBox: () => {},
    renderBeginPath: () => pointOut.writeBits(1, 1),
    renderBeginSegment: (last, initial) => pointOut.writeAny(last, initial),
    renderLineTo: (pt) => {
      if (pt[0] !== 0 || pt[1] !== 0) pointOut.writeRelative(pt)
    },
    renderEndSegment: () => pointOut.writeRelative([0, 0]),
    renderEndPath: () => {},
    renderEndDocument: () => {},
  })
  pointOut.writeBits(0, 1)
  pointOut.close()
}

export const decodeSVGR = (input: BitInStream, log: (message: string) => void): Svg => {
  const frequencyTable = readFrequencyTable(input)
  const codes = generateHuffmanCodes(frequencyTable)

  const viewBox = readAbsolute(input)
  const min = readAbsolute(input)
  log(`view box: ${viewBox}, min: ${min}`)

  const pointIn = pointInStream(min, huffmanInStream(codes, input))
  const segments = []
  let current: Pt = [0, 0]

  while (true) {
    if (pointIn.readBits(1) === 0) break
    let initial = pointIn.readAny(current)
    const lineTo = []
    while (true) {
      const pt = pointIn.readRelative()
      if (pt[0] === 0 && pt[1] === 0) break
      lineTo.push(pt)
      current = add(initial, pt)
    }
    const segment = { initial, lineTo, closed: true }
    segments.push(segment)
  }

  return {
    xy: [0, 0] as Pt,
    wh: viewBox,
    elements: [{ name: 'path', segments }],
  }
}
