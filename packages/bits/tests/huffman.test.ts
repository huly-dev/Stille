//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import { write } from 'bun'
import {
  bitOutputStream,
  buildHuffmanTree,
  byteArrayInStream,
  bytesCollector,
  countFrequencies,
  generateHuffmanCodes,
  huffmanDecode,
  huffmanEncoder,
  singleBitInStream,
} from '../src/'

import { type HuffmanCode } from '../src/huffman'

test('encode/decode', () => {
  const random = [3, 2, 5, 0, 2, 7, 4, 4, 4, 7, 0, 5, 3, 2, 1, 0, 2, 7, 4, 3, 4, 7, 0, 5, 7, 2]

  const frequencies = countFrequencies(random, 8)
  const huffmanTree = buildHuffmanTree(frequencies)
  const codes = generateHuffmanCodes(huffmanTree)

  const collector = bytesCollector()
  const out = bitOutputStream(collector)

  const encoder = huffmanEncoder(codes, out)
  random.forEach(encoder)
  encoder(-1)

  const result = collector.result()
  console.log(result)

  const savedCodes: HuffmanCode[] = []
  const outTest = {
    writeBits: (value: number, length: number) => savedCodes.push({ value, length }),
    write: () => {},
    close: () => {},
  }

  const encoderCodes = huffmanEncoder(codes, outTest)
  random.forEach(encoderCodes)
  encoderCodes(-1)

  for (let i = 0; i < random.length; i++) {
    const huffmanCode = codes[random[i]]
    expect(savedCodes[i]).toEqual(huffmanCode)
  }

  const expected = [0b10011100, 0b11011110, 0b1]

  expect(result[0]).toBe(expected[0])
  expect(result[1]).toBe(expected[1])

  const input = singleBitInStream(byteArrayInStream(result))
  const output = bytesCollector()

  huffmanDecode(codes, input, output)
  console.log(output.result())
})
