//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • core/svgr.test.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import { base91OutStream, bitOutStream, byteArrayInStream, bytesCollector, stringCollector } from '@huly/bits'
import { encodeSVGR, parseSVG } from '../src'
import { toAbsoluteSVG, toRelativeSVG } from '../src/svg'

test('encode / decode', async () => {
  const github = await Bun.file(import.meta.dir + '/linkedin.svg').text()
  const svg = parseSVG(github)
  const abs = toAbsoluteSVG(svg, [3, 3])
  const rel = toRelativeSVG(abs)

  const collector = bytesCollector()
  const out = bitOutStream(collector)

  encodeSVGR(rel, out, (message) => console.log(message))
  console.log(collector.result())

  //
  const collectorIn = byteArrayInStream(collector.result())
  const strCollector = stringCollector()
  const base91 = base91OutStream(strCollector)
  while (collectorIn.available()) base91.writeByte(collectorIn.readByte())
  base91.close()
  console.log(strCollector.result())

  // const input = bitInStream(byteArrayInStream(collector.result()))
  // const decoded = decodeSVGR(input, (message) => console.log(message))

  // expect(decoded).toEqual(svg)
})
