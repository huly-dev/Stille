//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import {
  bitOutputStream,
  byteArrayInStream,
  bytesCollector,
  countFrequencies,
  generateHuffmanCodes,
  huffmanDecode,
  huffmanEncoder,
  singleBitInStream,
} from '../src/'

test('encode/decode', () => {
  const random = [
    3, 2, 5, 1, 2, 7, 4, 4, 4, 7, 0, 5, 3, 2, 1, 0, 2, 7, 4, 3, 4, 7, 0, 5, 7, 2, 2, 7, 4, 4, 4, 7, 0, 5, 3, 2, 1, 0, 2,
    7, 4, 3, 4, 7, 0, 5, 7, 2, 4, 3, 4, 7, 0, 5, 7, 2, 4, 3, 0, 0, 0, 0, 0, 7,
  ]

  const frequencies = countFrequencies(random, 8)
  const codes = generateHuffmanCodes(frequencies)

  const collector = bytesCollector()
  const out = bitOutputStream(collector)

  const encoder = huffmanEncoder(codes, out)
  random.forEach(encoder)
  encoder(-1)

  const result = collector.result()
  console.log(result)

  const input = singleBitInStream(byteArrayInStream(result))
  const output = bytesCollector()

  huffmanDecode(codes, input, output)
  expect(output.result()).toEqual(random)
})
