//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import {
  buildHuffmanTree,
  countFrequencies,
  generateHuffmanCodes,
  huffmanEncoder,
  numberOfBits,
  type BitOutputStream,
} from '@huly/bits'
import { add, bounds, mul, round, sub } from './math'
import type { Element, Pt, SVG } from './svg'

const scalePoints = (points: Pt[], scale: Pt): Pt[] => {
  let float: Pt = [0, 0]
  let int: Pt = [0, 0]

  return points.map((pt) => {
    const scaled = mul(pt, scale)
    const next = add(float, scaled)
    const nextInt = round(next)
    const d = sub(nextInt, int)
    float = next
    int = nextInt
    return d
  })
}

const scaleElement = (element: Element, scale: Pt): Element => ({
  name: element.name,
  segments: element.segments.map((segment) => ({
    initial: round(mul(segment.initial, scale)),
    lineTo: scalePoints(segment.lineTo, scale).filter((pt) => pt[0] !== 0 || pt[1] !== 0),
    closed: segment.closed,
  })),
})

const MAX_ABSOLUTE_BITS = 13
const FREQUENCY_BITS = 5

export const encodeSVGR = (svg: SVG, scale: Pt, out: BitOutputStream, log: (message: string) => void) => {
  // const huffman = createHuffmanEncoder(codes, out)

  const { xy, wh } = svg
  if (xy[0] !== 0 || xy[1] !== 0) throw new Error('SVG file must have viewBox starting at 0,0')

  const renderBox = round(mul(wh, scale))
  log(`rendering to ${renderBox[0]}x${renderBox[1]} box...`)

  const scaledElements = svg.elements.map((element) => scaleElement(element, scale))

  out.writeBits(renderBox[0], MAX_ABSOLUTE_BITS)
  out.writeBits(renderBox[1], MAX_ABSOLUTE_BITS)

  // build frequency table

  const points = scaledElements.flatMap((element) =>
    element.segments.flatMap((segment) => {
      if (!segment.closed) throw new Error('support unclosed path segments')
      return [...segment.lineTo, [0, 0] as Pt]
    }),
  )

  const { min, box } = bounds(points)
  const alphabet = Math.max(box[0], box[1]) + 1
  log(`bounding box: min ${min}, box ${box}]`)

  const normalized = points.flatMap((pt) => sub(pt, min))
  log(`normalized to ${alphabet} symbols in alphabet`)

  const freq = countFrequencies(normalized, alphabet)
  const maxFreq = Math.max(...freq)
  const bitsPerFrequency = numberOfBits(maxFreq)
  log(`frequencies: ${freq}, maximum frequency: ${maxFreq}, ${bitsPerFrequency} bits per frequency`)

  out.writeBits(bitsPerFrequency, FREQUENCY_BITS)
  out.writeBits(alphabet, MAX_ABSOLUTE_BITS)
  freq.forEach((f) => out.writeBits(f, bitsPerFrequency))

  // write elements

  const huffmanTree = buildHuffmanTree(freq)
  const codes = generateHuffmanCodes(huffmanTree)
  // console.log(codes)

  const huffman = huffmanEncoder(codes, out)

  let segments = 0
  let current: Pt = [0, 0]

  const writeSign = (value: number, out: BitOutputStream) => out.writeBits(value < 0 ? 1 : 0, 1)

  scaledElements.forEach((element) => {
    switch (element.name) {
      case 'path':
        element.segments.forEach((segment) => {
          segments++
          const initial = segment.initial
          const d = sub(sub(initial, current), min)
          // console.log(`initial: ${initial}, current: ${current}, min: ${min}, d: ${d}, box: ${box}`)
          if (d[0] >= -box[0] && d[0] <= box[0] && d[1] >= -box[1] && d[1] <= box[1]) {
            // if (false) {
            // console.log(`relative`)
            out.writeBits(0, 1)
            huffman(Math.abs(d[0]))
            writeSign(d[0], out)
            huffman(Math.abs(d[1]))
            writeSign(d[1], out)
          } else {
            // console.log(`absolute`)
            out.writeBits(1, 1)
            out.writeBits(initial[0], MAX_ABSOLUTE_BITS)
            writeSign(initial[0], out)
            out.writeBits(initial[1], MAX_ABSOLUTE_BITS)
            writeSign(initial[1], out)
          }
          current = initial
          segment.lineTo.flatMap((pt) => sub(pt, min)).forEach((x) => huffman(x))
          if (!segment.closed) throw new Error('support unclosed path segments')
          huffman(0)
          huffman(0)
        })
        break
      default:
        throw new Error(`Unsupported element: ${element.name}`)
    }
  })

  out.close()
  log(`encoded ${segments} segments`)
}
