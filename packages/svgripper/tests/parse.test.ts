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
  let charsWritten = 0

  encodeSVG(parsed, 1600, 6, (char) => {
    if (char < 26) {
      result += String.fromCharCode(char + 65)
    } else if (char < 52) {
      result += String.fromCharCode(char + 71)
    } else if (char < 62) {
      result += String.fromCharCode(char - 4)
    } else if (char === 62) {
      result += '+'
    } else if (char === 63) {
      result += '/'
    } else throw new Error('invalid char')

    if (++charsWritten % 76 === 0) {
      result += '\n'
    }
  })

  console.log(result)
  console.log('charsWritten', charsWritten)
})
