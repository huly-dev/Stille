//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • undefined/decode.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { generateHuffmanCodes, type BitInStream } from '@huly/bits'
import { huffmanInStream } from '@huly/bits/src/huffman'
import { readFrequencyTable } from './svgr'

export const decodeSVGR = (input: BitInStream, log: (message: string) => void) => {
  const renderBox = readRenderBox(input)
  log(`render box: ${renderBox}`)

  const frequencyTable = readFrequencyTable(input, log)
  const codes = generateHuffmanCodes(frequencyTable)
  const huffman = huffmanInStream(codes, input)

  const reader = segmentReader()
  const segments = []
  while (true) {}
}
