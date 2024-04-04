import { expect, test } from 'bun:test'

import { round } from '../src/math'

test('round', () => {
  const point = round([1.1, 2.7])
  expect(point).toEqual([1, 3])
})
