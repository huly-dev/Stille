//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import { tokenize } from '../src/parse'

test('tokenize', () => {
  const d = tokenize('M 0 0 l 1 1 z')
  console.log(d)
  expect(d).toEqual([
    { type: 0, value: 'M' },
    { type: 1, value: 0 },
    { type: 1, value: 0 },
    { type: 0, value: 'l' },
    { type: 1, value: 1 },
    { type: 1, value: 1 },
    { type: 0, value: 'z' },
  ])
})
