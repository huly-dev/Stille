//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { createBitWriteStream, encodeBaseX } from '@huly/bits'
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

export async function encode(file: string, log: (message: string) => void, options: Options) {
  log('converting svg file to svgr format...')

  const svgText = await Bun.file(file).text()
  log(`file: ${file}, length: ${svgText.length} bytes`)

  const svg = parseSVG(svgText)
  const scale = getRatio(svg.wh, options)

  // const result: number[] = []
  let result = ''
  let bytesWritten = 0
  const quote = "'".charCodeAt(0)

  const baseEncoder = encodeBaseX(93, 13, 16, (x) => {
    const char = x + 33
    result += String.fromCharCode(char === quote ? 126 : char)
    bytesWritten++
  })

  const out = createBitWriteStream(32, (x) => {
    baseEncoder.writeByte(x & 0xff)
    baseEncoder.writeByte((x >> 8) & 0xff)
    baseEncoder.writeByte((x >> 16) & 0xff)
    baseEncoder.writeByte((x >> 24) & 0xff)
  })

  encodeSVGR(svg, scale, out, log)
  baseEncoder.flush()

  log(`bytesWritten: ${bytesWritten}`)

  console.log(result)
}
