//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • undefined/encode.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { countFrequencies, generateHuffmanCodes, type BitOutStream } from '@huly/bits'
import { add, bounds, mul, round, sub } from './math'
import type { Element, Svg } from './svg'
import { segmentWriter, writeFrequencyTable } from './svgr'
import type { Pt } from './types'

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

export const encodeSVGR = (svg: Svg, scale: Pt, out: BitOutStream, log: (message: string) => void) => {
  const { xy, wh } = svg
  if (xy[0] !== 0 || xy[1] !== 0) throw new Error('SVG file must have viewBox starting at 0,0')

  const renderBox = round(mul(wh, scale))
  log(`rendering to ${renderBox[0]}x${renderBox[1]} box...`)

  const scaledElements = svg.elements.map((element) => scaleElement(element, scale))
  writeRenderBox(out, renderBox)

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
  writeFrequencyTable(out, freq, log)

  const codes = generateHuffmanCodes(freq)
  const huffman = huffmanEncoder(codes, out)
  const writer = segmentWriter(min, box, huffman)

  scaledElements.forEach((element) => {
    switch (element.name) {
      case 'path':
        element.segments.reduce(writer, [0, 0])
        break
      default:
        throw new Error(`Unsupported element: ${element.name}`)
    }
  })

  huffman.close()
}
