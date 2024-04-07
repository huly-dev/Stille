//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • core/svg.test.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import {
  TokenType,
  generateSVG,
  parsePath,
  scaleSVG,
  toAbsoluteSVG,
  toRelativeSVG,
  tokenize,
  type Svg,
} from '../src/svg'

test('tokenize1', () => {
  const d = tokenize('M 0 8 l 1.2 -3.14 z')
  expect(d[0]).toEqual({ type: TokenType.CID, value: 'm', relative: false })
  expect(d[1]).toEqual({ type: TokenType.Number, value: 0 })
  expect(d[2]).toEqual({ type: TokenType.Number, value: 8 })
  expect(d[3]).toEqual({ type: TokenType.CID, value: 'l', relative: true })
  expect(d[4]).toEqual({ type: TokenType.Number, value: 1.2 })
  expect(d[5]).toEqual({ type: TokenType.Number, value: -3.14 })
  expect(d[6]).toEqual({ type: TokenType.CID, value: 'z', relative: true })
})

test('tokenize2', () => {
  const d = tokenize('M988.5 406l-0.5 3.1 0.8 2.9 3.1 0z')
  expect(d[0]).toEqual({ type: TokenType.CID, value: 'm', relative: false })
  expect(d[1]).toEqual({ type: TokenType.Number, value: 988.5 })
  expect(d[2]).toEqual({ type: TokenType.Number, value: 406 })
  expect(d[3]).toEqual({ type: TokenType.CID, value: 'l', relative: true })
  expect(d[4]).toEqual({ type: TokenType.Number, value: -0.5 })
  expect(d[5]).toEqual({ type: TokenType.Number, value: 3.1 })
  expect(d[6]).toEqual({ type: TokenType.Number, value: 0.8 })
  expect(d[7]).toEqual({ type: TokenType.Number, value: 2.9 })
  expect(d[8]).toEqual({ type: TokenType.Number, value: 3.1 })
  expect(d[9]).toEqual({ type: TokenType.Number, value: 0 })
  expect(d[10]).toEqual({ type: TokenType.CID, value: 'z', relative: true })
})

test('parse1', () => {
  const d = tokenize('M 0 8 l 1.2 -3.14 z')
  const path = parsePath(d)
  expect(path.d.length).toEqual(3)
})

test('parse2', () => {
  const d = tokenize('M988.5 406l-0.5 3.1 0.8 2.9 3.1 0z')
  const path = parsePath(d)
  expect(path.d.length).toEqual(5)
  expect(path.d[1]).toEqual({ command: 'l', xy: [-0.5, 3.1], relative: true })
  expect(path.d[2]).toEqual({ command: 'l', xy: [0.8, 2.9], relative: true })
})

test('generate svg', () => {
  const svg: Svg = {
    xy: [0, 0],
    wh: [1000, 1000],
    elements: [
      {
        name: 'path',
        d: [
          { command: 'm', relative: false, xy: [100, 100] },
          { command: 'l', relative: true, xy: [10, 10] },
          { command: 'l', relative: true, xy: [-20, 30] },
          { command: 'm', relative: true, xy: [-10, -30] },
          { command: 'l', relative: true, xy: [2, -3] },
          { command: 'l', relative: true, xy: [-2, -3] },
          { command: 'z', relative: true, xy: [0, 0] },
        ],
      },
    ],
  }

  const text = generateSVG(svg)
  expect(text).toBe('<svg viewBox="0 0 1000 1000"><path d="M100,100,10,10-20,30m-10-30,2-3-2-3z" /></svg>')
})

test('to relative', () => {
  const svg: Svg = {
    xy: [0, 0],
    wh: [1000, 1000],
    elements: [
      {
        name: 'path',
        d: [
          { command: 'm', relative: false, xy: [100, 100] },
          { command: 'l', relative: false, xy: [110, 110] },
          { command: 'l', relative: false, xy: [80, 50] },
          { command: 'm', relative: false, xy: [50, 100] },
          { command: 'l', relative: false, xy: [0, 0] },
          { command: 'l', relative: false, xy: [150, 100] },
          { command: 'z', relative: true, xy: [0, 0] },
        ],
      },
    ],
  }
  const rel = generateSVG(toRelativeSVG(svg))
  expect(rel).toBe('<svg viewBox="0 0 1000 1000"><path d="m100,100,10,10-30-60m-30,50-50-100,150,100z" /></svg>')
})

test('scale', async () => {
  const svg: Svg = {
    xy: [0, 0],
    wh: [1000, 1000],
    elements: [
      {
        name: 'path',
        d: [
          { command: 'm', relative: false, xy: [100, 100] },
          { command: 'l', relative: true, xy: [10, 10] },
          { command: 'l', relative: true, xy: [-20, 30] },
          { command: 'm', relative: true, xy: [-10, -30] },
          { command: 'l', relative: true, xy: [2, -3] },
          { command: 'l', relative: true, xy: [-2, -3] },
          { command: 'z', relative: true, xy: [0, 0] },
        ],
      },
    ],
  }

  const scaled = generateSVG(scaleSVG(svg, [1.333, 1.333]))
  expect(scaled).toBe(
    '<svg viewBox="0 0 1333 1333"><path d="M133,133,147,147,120,187M107,147,109,143,107,139Z" /></svg>',
  )
})

test('analyze SVG', async () => {
  // const svg = await Bun.file(import.meta.dir + '/world.svg').text()
  // const parsed = parseSVG(svg)
  // analyzeSVG(parsed)
})
