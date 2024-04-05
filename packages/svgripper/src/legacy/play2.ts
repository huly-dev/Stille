//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • undefined/play2.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//
import {
  buildHuffmanTree,
  countFrequencies,
  createBitWriteStream,
  createHuffmanEncoder,
  encodeBaseX,
  generateHuffmanCodes,
  numberOfBits,
} from '@huly/bits'
import { extendPath, max, min, roundSVG, scaleSVG, sum } from './analyze'
import { parseSVG } from './parse'
import type { Pt } from './svg'

const svgText = await Bun.file(import.meta.dir + '/../tests/world.svg').text()

const svg = parseSVG(svgText)
const svgInt = roundSVG(scaleSVG(svg, 20000 / 2000))

const svgLines = getPathsSVG(svg).flat()
console.log(svgLines.length, svgLines[100])

const intLines = getPathsSVG(svgInt).flat()
console.log(intLines.length, intLines[100])

const sumSvg = sum(svgLines)
const sumInt = sum(intLines)

console.log({ sumSvg, sumInt })

function analyze(cut: number) {
  const extended = intLines.flatMap(extendPath([-cut, -cut], [cut, cut]))
  const verify = sum(extended)
  const length = extended.length * 2
  const estimated = (length * numberOfBits(2 * cut)) / 8

  console.log({ cut, verify, length, estimated })

  const unsigned = extended.map((point): Pt => [point[0] + cut, point[1] + cut]) // [0..2*cut]
  console.log(max(unsigned), min(unsigned))

  const freq = countFrequencies(unsigned.flat(), 2 * cut + 1)
  console.log('freq', freq.length)

  const huffmanTree = buildHuffmanTree(freq)
  const codes = generateHuffmanCodes(huffmanTree)

  console.log('codes.length', codes.length)

  let bytesWritten = 0

  const result: number[] = []

  const bitWriteStream = createBitWriteStream(16, (x) => {
    result.push(x & 0xff)
    result.push((x >> 8) & 0xff)
    bytesWritten++
  })

  const huffmanEncoder = createHuffmanEncoder(codes, bitWriteStream)
  unsigned.flat().forEach((point) => huffmanEncoder(point))

  console.log({ bytesWritten: bytesWritten * 2 })

  return result
}

const compressed = analyze(255)

let outString = ''
let outBytes = 0

const encoder = encodeBaseX(94, 13, 16, (x) => {
  outString += String.fromCharCode(x + 32)
  if (++outBytes % 200 === 0) outString += '\n'
})

compressed.forEach((x) => encoder.writeByte(x))
encoder.flush()

console.log(outString)

// countBytes(128)
// const i64 = analyze(64)
// countBytes(32)
// countBytes(16)
