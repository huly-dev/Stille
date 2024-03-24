//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import { extractCoordinates, minMax } from '../src/analyzer'
// import { encoder } from '../src/encoder'

// test('encoder', () => {
//   const result: number[] = []
//   const e = encoder(8, (value) => {
//     result.push(value)
//   })
//   e.writeUInt(0b101, 3)
//   e.writeUInt(0b1101, 4)
//   e.writeUInt(0b10101, 5)
//   e.flush()
//   expect(result).toEqual([0b11101101, 0b1010])
// })

test('svg-encoder', async () => {
  const svg = await Bun.file(import.meta.dir + '/world.svg').text()
  // const result = encodeSVG(svg)

  const data = extractCoordinates(svg)
  // console.log(data)
  console.log('viewbox', data.viewbox)
  console.log('absolute', data.absolute.length)
  console.log('relative', data.relative.length)
  console.log('absolute', minMax(data.absolute))
  console.log('relative', minMax(data.relative))
})
