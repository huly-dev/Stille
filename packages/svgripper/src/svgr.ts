//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import {
  countFrequencies,
  generateHuffmanCodes,
  huffmanInStream,
  numberOfBits,
  type BitInStream,
  type BitOutStream,
} from '@huly/bits'
import { huffmanOutStream } from '@huly/bits/src/huffman'
import { add, bounds, sub } from './math'
import { MAX_COORDINATE, pointInStream, pointOutStream, readAbsolute, writeAbsolute, type PointInStream } from './point'
import { renderSVG, type PathSegment, type Svg } from './svg'
import type { Pt } from './types'

const FREQUENCY_BITS = 5
const ALPHABET_BITS = 13

export const writeFrequencyTable = (out: BitOutStream, frequencies: number[], log: (message: string) => void) => {
  const maxFreq = Math.max(...frequencies)
  const bitsPerFrequency = numberOfBits(maxFreq)

  log(`frequencies: ${frequencies}, maximum frequency: ${maxFreq}, ${bitsPerFrequency} bits per frequency`)

  out.writeBits(bitsPerFrequency, FREQUENCY_BITS)
  out.writeBits(frequencies.length, ALPHABET_BITS)
  frequencies.forEach((f) => out.writeBits(f, bitsPerFrequency))
}

export const readFrequencyTable = (input: BitInStream, log: (message: string) => void): number[] => {
  const bitsPerFrequency = input.readBits(FREQUENCY_BITS)
  const count = input.readBits(ALPHABET_BITS)
  const frequencies = Array.from({ length: count }, () => input.readBits(bitsPerFrequency))

  log(`frequencies: ${frequencies}, ${bitsPerFrequency} bits per frequency`)
  return frequencies
}

///

export const segmentReader =
  (input: PointInStream) =>
  (current: Pt): { segment: PathSegment; current: Pt } => {
    let initial = input.readAny(current)
    const lineTo = []
    while (true) {
      const pt = input.readRelative()
      if (pt[0] === 0 && pt[1] === 0) break
      lineTo.push(p)
      current = add(initial, p)
    }
    return {
      segment: { initial, lineTo, closed: true },
      current,
    }
  }

///

export const encodeSVGR = (svg: Svg, out: BitOutStream, log: (message: string) => void) => {
  const points: Pt[] = []
  renderSVG(svg, {
    renderLineTo: (pt) => points.push(pt),
    renderEndPath: () => points.push([0, 0]),
  })

  const { min, max } = bounds(points)
  if (min[0] > 0 || min[1] > 0) throw new Error(`negative min assumption violated: ${min}`)

  const box = sub(max, min)
  const alphabet = Math.max(box[0], box[1]) + 1
  log(`bounding box: min ${min}, max ${max}, box ${box}]`)

  writeAbsolute(out, box)
  writeAbsolute(out, min)

  const symbols = points.flatMap((pt) => sub(pt, min))
  log(`converted to ${alphabet} symbols in alphabet`)

  const freq = countFrequencies(symbols, alphabet)
  writeFrequencyTable(out, freq, log)

  const codes = generateHuffmanCodes(freq)
  const huffman = huffmanOutStream(codes, out)

  const pointOut = pointOutStream(min, max, huffman)
  renderSVG(svg, {
    renderBeginSegment: (last, initial) => pointOut.writeAny(last, initial),
    renderLineTo: (pt) => pointOut.writeRelative(pt),
    renderEndSengment: () => pointOut.writeRelative([0, 0]),
    renderEndPath: () => pointOut.writeAbsolute([MAX_COORDINATE, MAX_COORDINATE]),
  })
  pointOut.close()
}

export const decodeSVGR = (input: BitInStream, log: (message: string) => void): Svg => {
  const frequencyTable = readFrequencyTable(input, log)
  const codes = generateHuffmanCodes(frequencyTable)

  const viewBox = readAbsolute(input)
  const min = readAbsolute(input)

  const pointIn = pointInStream(min, huffmanInStream(codes, input))
  const segments = []
  let current: Pt = [0, 0]

  while (true) {
    let initial = pointIn.readAny(current)
    if (initial[0] === MAX_COORDINATE && initial[1] === MAX_COORDINATE) break
    const lineTo = []
    while (true) {
      const pt = pointIn.readRelative()
      if (pt[0] === 0 && pt[1] === 0) break
      lineTo.push(pt)
      current = add(initial, pt)
    }
    segments.push({ initial, lineTo, closed: true })
  }

  return {
    xy: [0, 0] as Pt,
    wh: viewBox,
    elements: [{ name: 'path', segments }],
  }
}
