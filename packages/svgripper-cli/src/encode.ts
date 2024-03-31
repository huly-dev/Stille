//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import {
  base91OutputStream,
  bitToByteOutputStream,
  fileOutputStream,
  isStringOutputStream,
  stringOutputStream,
  type BinaryOutputStream,
} from '@huly/bits'
import { encodeSVGR, parseSVG, type Pt } from 'svgripper'

type Options = {
  output?: string
  binary?: boolean
  width?: number
  height?: number
  degree: number
}

function getRatio(viewBox: Pt, options: Options): Pt {
  const { width, height } = options
  if (width && height) return [width / viewBox[0], height / viewBox[1]]
  const ratio = width ? width / viewBox[0] : height ? height / viewBox[1] : 1
  return [ratio, ratio]
}

const createOutputStream = (options: Options): BinaryOutputStream => {
  if (options.binary) {
    if (!options.output) throw new Error('output file is required for binary output')
    return fileOutputStream(options.output)
  }
  const stringOS = stringOutputStream()
  return base91OutputStream(stringOS)
}

export async function encode(file: string, log: (message: string) => void, options: Options) {
  log('converting svg file to svgr format...')

  const svgText = await Bun.file(file).text()
  log(`file: ${file}, length: ${svgText.length} bytes`)

  const svg = parseSVG(svgText)
  const scale = getRatio(svg.wh, options)

  const out = createOutputStream(options)
  const bitStream = bitToByteOutputStream(out)

  encodeSVGR(svg, scale, bitStream, log)
  bitStream.close()

  if (isStringOutputStream(out)) console.log(out.result())
}
