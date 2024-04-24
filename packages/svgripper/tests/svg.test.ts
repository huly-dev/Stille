//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • core/svg.test.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import type { Cid, Command } from '../src/path'
import {
  TokenType,
  generateSVG,
  parsePath,
  parseSVG,
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

test('tokenize3', () => {
  const d = tokenize(
    'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
  )

  expect(d).toEqual([
    { type: 0, value: 'm', relative: false },
    { type: 1, value: 12 },
    { type: 1, value: 0 },
    { type: 0, value: 'c', relative: true },
    { type: 1, value: -6.626 },
    { type: 1, value: 0 },
    { type: 1, value: -12 },
    { type: 1, value: 5.373 },
    { type: 1, value: -12 },
    { type: 1, value: 12 },
    { type: 1, value: 0 },
    { type: 1, value: 5.302 },
    { type: 1, value: 3.438 },
    { type: 1, value: 9.8 },
    { type: 1, value: 8.207 },
    { type: 1, value: 11.387 },
    { type: 1, value: 0.599 },
    { type: 1, value: 0.111 },
    { type: 1, value: 0.793 },
    { type: 1, value: -0.261 },
    { type: 1, value: 0.793 },
    { type: 1, value: -0.577 },
    { type: 0, value: 'v', relative: true },
    { type: 1, value: -2.234 },
    { type: 0, value: 'c', relative: true },
    { type: 1, value: -3.338 },
    { type: 1, value: 0.726 },
    { type: 1, value: -4.033 },
    { type: 1, value: -1.416 },
    { type: 1, value: -4.033 },
    { type: 1, value: -1.416 },
    { type: 1, value: -0.546 },
    { type: 1, value: -1.387 },
    { type: 1, value: -1.333 },
    { type: 1, value: -1.756 },
    { type: 1, value: -1.333 },
    { type: 1, value: -1.756 },
    { type: 1, value: -1.089 },
    { type: 1, value: -0.745 },
    { type: 1, value: 0.083 },
    { type: 1, value: -0.729 },
    { type: 1, value: 0.083 },
    { type: 1, value: -0.729 },
    { type: 1, value: 1.205 },
    { type: 1, value: 0.084 },
    { type: 1, value: 1.839 },
    { type: 1, value: 1.237 },
    { type: 1, value: 1.839 },
    { type: 1, value: 1.237 },
    { type: 1, value: 1.07 },
    { type: 1, value: 1.834 },
    { type: 1, value: 2.807 },
    { type: 1, value: 1.304 },
    { type: 1, value: 3.492 },
    { type: 1, value: 0.997 },
    { type: 1, value: 0.107 },
    { type: 1, value: -0.775 },
    { type: 1, value: 0.418 },
    { type: 1, value: -1.305 },
    { type: 1, value: 0.762 },
    { type: 1, value: -1.604 },
    { type: 1, value: -2.665 },
    { type: 1, value: -0.305 },
    { type: 1, value: -5.467 },
    { type: 1, value: -1.334 },
    { type: 1, value: -5.467 },
    { type: 1, value: -5.931 },
    { type: 1, value: 0 },
    { type: 1, value: -1.311 },
    { type: 1, value: 0.469 },
    { type: 1, value: -2.381 },
    { type: 1, value: 1.236 },
    { type: 1, value: -3.221 },
    { type: 1, value: -0.124 },
    { type: 1, value: -0.303 },
    { type: 1, value: -0.535 },
    { type: 1, value: -1.524 },
    { type: 1, value: 0.117 },
    { type: 1, value: -3.176 },
    { type: 1, value: 0 },
    { type: 1, value: 0 },
    { type: 1, value: 1.008 },
    { type: 1, value: -0.322 },
    { type: 1, value: 3.301 },
    { type: 1, value: 1.23 },
    { type: 1, value: 0.957 },
    { type: 1, value: -0.266 },
    { type: 1, value: 1.983 },
    { type: 1, value: -0.399 },
    { type: 1, value: 3.003 },
    { type: 1, value: -0.404 },
    { type: 1, value: 1.02 },
    { type: 1, value: 0.005 },
    { type: 1, value: 2.047 },
    { type: 1, value: 0.138 },
    { type: 1, value: 3.006 },
    { type: 1, value: 0.404 },
    { type: 1, value: 2.291 },
    { type: 1, value: -1.552 },
    { type: 1, value: 3.297 },
    { type: 1, value: -1.23 },
    { type: 1, value: 3.297 },
    { type: 1, value: -1.23 },
    { type: 1, value: 0.653 },
    { type: 1, value: 1.653 },
    { type: 1, value: 0.242 },
    { type: 1, value: 2.874 },
    { type: 1, value: 0.118 },
    { type: 1, value: 3.176 },
    { type: 1, value: 0.77 },
    { type: 1, value: 0.84 },
    { type: 1, value: 1.235 },
    { type: 1, value: 1.911 },
    { type: 1, value: 1.235 },
    { type: 1, value: 3.221 },
    { type: 1, value: 0 },
    { type: 1, value: 4.609 },
    { type: 1, value: -2.807 },
    { type: 1, value: 5.624 },
    { type: 1, value: -5.479 },
    { type: 1, value: 5.921 },
    { type: 1, value: 0.43 },
    { type: 1, value: 0.372 },
    { type: 1, value: 0.823 },
    { type: 1, value: 1.102 },
    { type: 1, value: 0.823 },
    { type: 1, value: 2.222 },
    { type: 0, value: 'v', relative: true },
    { type: 1, value: 3.293 },
    { type: 0, value: 'c', relative: true },
    { type: 1, value: 0 },
    { type: 1, value: 0.319 },
    { type: 1, value: 0.192 },
    { type: 1, value: 0.694 },
    { type: 1, value: 0.801 },
    { type: 1, value: 0.576 },
    { type: 1, value: 4.765 },
    { type: 1, value: -1.589 },
    { type: 1, value: 8.199 },
    { type: 1, value: -6.086 },
    { type: 1, value: 8.199 },
    { type: 1, value: -11.386 },
    { type: 1, value: 0 },
    { type: 1, value: -6.627 },
    { type: 1, value: -5.373 },
    { type: 1, value: -12 },
    { type: 1, value: -12 },
    { type: 1, value: -12 },
    { type: 0, value: 'z', relative: true },
  ])
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

  const scaled = generateSVG(toAbsoluteSVG(svg, [1.333, 1.333]))
  expect(scaled).toBe(
    '<svg viewBox="0 0 1333 1333"><path d="M133,133,147,147,120,187M107,147,109,143,107,139Z" /></svg>',
  )
})

test('parse svg', async () => {
  const github = await Bun.file(import.meta.dir + '/github.svg').text()

  const svg = parseSVG(github)
  expect(svg.elements[0].d).toEqual([
    { command: 'm', relative: false, xy: [12, 0] },
    { command: 'c', relative: true, xy1: [-6.626, 0], xy2: [-12, 5.373], xy: [-12, 12] },
    { command: 'l', relative: true, xy: [0, 5.302] },
    { command: 'l', relative: true, xy: [3.438, 9.8] },
    { command: 'l', relative: true, xy: [8.207, 11.387] },
    { command: 'l', relative: true, xy: [0.599, 0.111] },
    { command: 'l', relative: true, xy: [0.793, -0.261] },
    { command: 'l', relative: true, xy: [0.793, -0.577] },
    { command: 'l', relative: true, xy: [0, -2.234] },
    { command: 'c', relative: true, xy1: [-3.338, 0.726], xy2: [-4.033, -1.416], xy: [-4.033, -1.416] },
    { command: 'l', relative: true, xy: [-0.546, -1.387] },
    { command: 'l', relative: true, xy: [-1.333, -1.756] },
    { command: 'l', relative: true, xy: [-1.333, -1.756] },
    { command: 'l', relative: true, xy: [-1.089, -0.745] },
    { command: 'l', relative: true, xy: [0.083, -0.729] },
    { command: 'l', relative: true, xy: [0.083, -0.729] },
    { command: 'l', relative: true, xy: [1.205, 0.084] },
    { command: 'l', relative: true, xy: [1.839, 1.237] },
    { command: 'l', relative: true, xy: [1.839, 1.237] },
    { command: 'l', relative: true, xy: [1.07, 1.834] },
    { command: 'l', relative: true, xy: [2.807, 1.304] },
    { command: 'l', relative: true, xy: [3.492, 0.997] },
    { command: 'l', relative: true, xy: [0.107, -0.775] },
    { command: 'l', relative: true, xy: [0.418, -1.305] },
    { command: 'l', relative: true, xy: [0.762, -1.604] },
    { command: 'l', relative: true, xy: [-2.665, -0.305] },
    { command: 'l', relative: true, xy: [-5.467, -1.334] },
    { command: 'l', relative: true, xy: [-5.467, -5.931] },
    { command: 'l', relative: true, xy: [0, -1.311] },
    { command: 'l', relative: true, xy: [0.469, -2.381] },
    { command: 'l', relative: true, xy: [1.236, -3.221] },
    { command: 'l', relative: true, xy: [-0.124, -0.303] },
    { command: 'l', relative: true, xy: [-0.535, -1.524] },
    { command: 'l', relative: true, xy: [0.117, -3.176] },
    { command: 'l', relative: true, xy: [0, 0] },
    { command: 'l', relative: true, xy: [1.008, -0.322] },
    { command: 'l', relative: true, xy: [3.301, 1.23] },
    { command: 'l', relative: true, xy: [0.957, -0.266] },
    { command: 'l', relative: true, xy: [1.983, -0.399] },
    { command: 'l', relative: true, xy: [3.003, -0.404] },
    { command: 'l', relative: true, xy: [1.02, 0.005] },
    { command: 'l', relative: true, xy: [2.047, 0.138] },
    { command: 'l', relative: true, xy: [3.006, 0.404] },
    { command: 'l', relative: true, xy: [2.291, -1.552] },
    { command: 'l', relative: true, xy: [3.297, -1.23] },
    { command: 'l', relative: true, xy: [3.297, -1.23] },
    { command: 'l', relative: true, xy: [0.653, 1.653] },
    { command: 'l', relative: true, xy: [0.242, 2.874] },
    { command: 'l', relative: true, xy: [0.118, 3.176] },
    { command: 'l', relative: true, xy: [0.77, 0.84] },
    { command: 'l', relative: true, xy: [1.235, 1.911] },
    { command: 'l', relative: true, xy: [1.235, 3.221] },
    { command: 'l', relative: true, xy: [0, 4.609] },
    { command: 'l', relative: true, xy: [-2.807, 5.624] },
    { command: 'l', relative: true, xy: [-5.479, 5.921] },
    { command: 'l', relative: true, xy: [0.43, 0.372] },
    { command: 'l', relative: true, xy: [0.823, 1.102] },
    { command: 'l', relative: true, xy: [0.823, 2.222] },
    { command: 'l', relative: true, xy: [0, 3.293] },
    { command: 'c', relative: true, xy1: [0, 0.319], xy2: [0.192, 0.694], xy: [0.801, 0.576] },
    { command: 'l', relative: true, xy: [4.765, -1.589] },
    { command: 'l', relative: true, xy: [8.199, -6.086] },
    { command: 'l', relative: true, xy: [8.199, -11.386] },
    { command: 'l', relative: true, xy: [0, -6.627] },
    { command: 'l', relative: true, xy: [-5.373, -12] },
    { command: 'l', relative: true, xy: [-12, -12] },
    { command: 'z', relative: true, xy: [0, 0] },
  ] as Command<Cid>[])
})
