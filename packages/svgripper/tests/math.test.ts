import { expect, test } from 'bun:test'

import { $, mul, round } from '../src/math'

test('math', () => {
  const point = round([1.1, 2.7])
  expect(point).toEqual([1, 3])

  expect($(round, () => [7.7, 7.7])([1.1, 2.2])).toEqual([8, 8])
  expect($(() => [7.7, 7.7], round)([1.1, 2.2])).toEqual([7.7, 7.7])
  expect($(round, mul([2, 2]))([3.3, 3.3])).toEqual([7, 7])
})
