//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import { extractComands, minmax, scale } from '../src/analyzer'
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

function numberOfBits(num: number): number {
  const i = Math.ceil(num)
  if (i === 0) return 1
  return Math.floor(Math.log2(i)) + 1
}

// test('svg-encoder', async () => {
//   const svg = await Bun.file(import.meta.dir + '/world.svg').text()
//   // const result = encodeSVG(svg)

//   const factorX = 2048 / 2000
//   const factorY = 1024 / 857

//   const data = extractComands(svg)
//   // console.log(data)
//   console.log('viewbox', data.viewbox)
//   console.log('ABSOLUTE')
//   data.absolute.forEach((command) => {
//     if (command.coords.length < 2) return
//     const coords = scale(command.coords, factorX, factorY)
//     const { minX, maxX, minY, maxY } = minmax(coords)
//     const dX = maxX - minX
//     const dY = maxY - minY
//     // console.log(command.d)
//     // console.log(command.coords)
//     console.log(
//       command.command,
//       'minX',
//       minX.toFixed(1),
//       'maxX',
//       maxX.toFixed(1),
//       'minY',
//       minY.toFixed(1),
//       'maxY',
//       maxY.toFixed(1),
//       'dX',
//       dX.toFixed(1),
//       'dY',
//       dY.toFixed(1),
//       'len',
//       command.coords.length,
//       `\t${numberOfBits(dX)}\t${numberOfBits(dY)}`,
//     )
//   })
//   data.relative.forEach((command) => {
//     if (command.coords.length < 2) return
//     const coords = scale(command.coords, factorX, factorY)
//     const { minX, maxX, minY, maxY } = minmax(coords)
//     const dX = maxX - minX
//     const dY = maxY - minY
//     // console.log(command.d)
//     // console.log(command.coords)
//     console.log(
//       command.command,
//       'minX',
//       minX.toFixed(1),
//       'maxX',
//       maxX.toFixed(1),
//       'minY',
//       minY.toFixed(1),
//       'maxY',
//       maxY.toFixed(1),
//       'dX',
//       dX.toFixed(1),
//       'dY',
//       dY.toFixed(1),
//       'len',
//       command.coords.length,
//       `\t${numberOfBits(dX)}\t${numberOfBits(dY)}`,
//     )
//   })
// })
