//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { createHuffmanEncoder, type BitWriteStream, type HuffmanCodes } from '@huly/bits'
import type { SVG } from './svg'

const MAX_ABSOLUTE_BITS = 13

export const encodeSVGR = (svg: SVG, codes: HuffmanCodes, out: BitWriteStream) => {
  const huffman = createHuffmanEncoder(codes, out)

  // Write viewBox. We're limiting viewbox to 8192x8192, so we can encode it in 13 bits.'
  out.writeBits(svg.wh[0], MAX_ABSOLUTE_BITS)
  out.writeBits(svg.wh[1], MAX_ABSOLUTE_BITS)

  // Write elements
  svg.elements.forEach((element) => {
    switch (element.name) {
      case 'path':
        element.segments.forEach((segment) => {
          const initial = segment.initial
          out.writeBits(initial[0], MAX_ABSOLUTE_BITS)
          out.writeBits(initial[1], MAX_ABSOLUTE_BITS)
          segment.lineTo.flat().forEach((x) => huffman(x))
        })
        break
      default:
        throw new Error(`Unsupported element: ${element.name}`)
    }
  })
}
