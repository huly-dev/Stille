//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import { analyzeSVG, scale } from '../src/analyze'
import { encodeSVG } from '../src/encode'
import { TokenType, parsePath, parseSVG, tokenize } from '../src/parse'

test('tokenize1', () => {
  const d = tokenize('M 0 8 l 1.2 -3.14 z')
  expect(d[0]).toEqual({ type: TokenType.CID, value: 'M' })
  expect(d[1]).toEqual({ type: TokenType.Number, value: 0 })
  expect(d[2]).toEqual({ type: TokenType.Number, value: 8 })
  expect(d[3]).toEqual({ type: TokenType.CID, value: 'l' })
  expect(d[4]).toEqual({ type: TokenType.Number, value: 1.2 })
  expect(d[5]).toEqual({ type: TokenType.Number, value: -3.14 })
  expect(d[6]).toEqual({ type: TokenType.CID, value: 'z' })
})

test('tokenize2', () => {
  const d = tokenize('M988.5 406l-0.5 3.1 0.8 2.9 3.1 0z')
  expect(d[0]).toEqual({ type: TokenType.CID, value: 'M' })
  expect(d[1]).toEqual({ type: TokenType.Number, value: 988.5 })
  expect(d[2]).toEqual({ type: TokenType.Number, value: 406 })
  expect(d[3]).toEqual({ type: TokenType.CID, value: 'l' })
  expect(d[4]).toEqual({ type: TokenType.Number, value: -0.5 })
  expect(d[5]).toEqual({ type: TokenType.Number, value: 3.1 })
  expect(d[6]).toEqual({ type: TokenType.Number, value: 0.8 })
  expect(d[7]).toEqual({ type: TokenType.Number, value: 2.9 })
  expect(d[8]).toEqual({ type: TokenType.Number, value: 3.1 })
  expect(d[9]).toEqual({ type: TokenType.Number, value: 0 })
  expect(d[10]).toEqual({ type: TokenType.CID, value: 'z' })
})

test('parse1', () => {
  const d = tokenize('M 0 8 l 1.2 -3.14 z')
  const path = parsePath(d)
  expect(path.segments.length).toEqual(1)
  const segment = path.segments[0]
  expect(segment.commands.length).toEqual(1)
})

test('parse2', () => {
  const d = tokenize('M988.5 406l-0.5 3.1 0.8 2.9 3.1 0z')
  const path = parsePath(d)
  expect(path.segments.length).toEqual(1)
  const segment = path.segments[0]
  expect(segment.commands.length).toEqual(3)
  expect(segment.commands[0]).toEqual({ command: 'lineto', dest: [-0.5, 3.1] })
  expect(segment.commands[1]).toEqual({ command: 'lineto', dest: [0.8, 2.9] })
})

test('scale', () => {
  const d = tokenize('M988.5 406l-0.5 3.1 0.8 2.9 3.1 0z')
  const path = parsePath(d)
  const scaled = scale(path.segments[0].commands, 2, 2)
  expect(scaled[0]).toEqual({ command: 'lineto', dest: [-1, 6.2] })
  expect(scaled[1]).toEqual({ command: 'lineto', dest: [1.6, 5.8] })
  expect(scaled[2]).toEqual({ command: 'lineto', dest: [6.2, 0] })
})

test('parse SVG', async () => {
  // const svg = await Bun.file(import.meta.dir + '/world.svg').text()
  // const _ = parseSVG(svg)
})

test('analyze SVG', async () => {
  const svg = await Bun.file(import.meta.dir + '/world.svg').text()
  const parsed = parseSVG(svg)
  analyzeSVG(parsed)
})

test('encode SVG', async () => {
  const svg = await Bun.file(import.meta.dir + '/world.svg').text()
  const parsed = parseSVG(svg)
  analyzeSVG(parsed)

  let result = ''
  let buffer = 1n
  let bytes = 0

  let blocksWritten = 0

  const Base = 93n

  // 13 / 16

  encodeSVG(parsed, 1024, 8, (char) => {
    buffer *= 256n
    buffer += BigInt(char)
    bytes++
    if (bytes === 13) {
      for (let i = 0; i < 16; i++) {
        const letter = Number(buffer % Base)
        let c = String.fromCharCode(32 + letter)
        if (c === '`') c = String.fromCharCode(126)
        if (c === '\\') c = String.fromCharCode(125)
        result += c
        buffer /= Base
      }
      buffer = 1n
      bytes = 0

      if (++blocksWritten % 16 === 0) {
        result += '\n'
        blocksWritten = 0
      }
    }
  })

  console.log(result)
})

// test('encode SVG 2', () => {
//   let minRatio = 100

//   let p256 = 1
//   let p93 = 1
//   for (let i = 0; i < 100; i++) {
//     const max256 = 256n ** BigInt(p256)
//     const max93 = 93n ** BigInt(p93)
//     if (max93 < max256) {
//       p93 += 1
//       continue
//     }

//     const ratio = p93 / p256
//     if (ratio < minRatio) {
//       minRatio = ratio
//       console.log('new min ratio', minRatio)
//       console.log(p256, p93)
//       console.log(max256)
//       console.log(max93)
//       console.log()
//     }

//     p256 += 1
//   }
// })
