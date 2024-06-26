//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • svgripper-cli/decode.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { bitInStream, fileInStream } from '@huly/bits'

import { decodeSVGR, generateSVG } from 'svgripper'

type Options = {
  binary?: boolean
  input?: string
}

export async function decode(file: string, log: (message: string) => void, options: Options) {
  log('decoding svgr format...')
  const svgr = await fileInStream(file)
  const svg = decodeSVGR(bitInStream(svgr), log)
  const text = generateSVG(svg)
  console.log(text)
}
