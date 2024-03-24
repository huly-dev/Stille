//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import { TokenType, tokenize } from '../src/parse'

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
