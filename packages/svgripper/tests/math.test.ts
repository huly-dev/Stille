//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • undefined/math.test.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//
import { expect, test } from 'bun:test'

import { round } from '../src/math'

test('round', () => {
  const point = round([1.1, 2.7])
  expect(point).toEqual([1, 3])
})
