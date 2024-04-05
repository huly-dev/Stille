//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • undefined/svgr.test.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import {
  bitInStream,
  bitOutStream,
  byteArrayInStream,
  bytesCollector,
  type SymbolInStream,
  type SymbolOutStream,
} from '@huly/bits'
import { decodeSVGR, encodeSVGR, type Svg } from '../src'

test('encode / decode', () => {
  const svg: Svg = {
    xy: [0, 0],
    wh: [1000, 1000],
    elements: [
      {
        name: 'path',
        segments: [
          {
            initial: [100, 100],
            lineTo: [
              [10, 10],
              [-20, 30],
            ],
            closed: true,
          },
        ],
      },
    ],
  }

  const collector = bytesCollector()
  const out = bitOutStream(collector)

  encodeSVGR(svg, out, (message) => console.log(message))
  console.log(collector.result())

  const input = bitInStream(byteArrayInStream(collector.result()))
  const decoded = decodeSVGR(input, (message) => console.log(message))

  expect(decoded).toEqual(svg)
})
