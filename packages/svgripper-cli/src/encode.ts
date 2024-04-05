//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { base91OutStream, bitOutStream, fileOutStream, stringCollector } from '@huly/bits'
import {
  add,
  encodeSVGR,
  mul,
  parseSVG,
  renderSVG,
  round,
  sub,
  type Element,
  type PathSegment,
  type Pt,
  type Svg,
} from 'svgripper'

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

const createOutput = (options: Options) => {
  if (options.binary) {
    if (!options.output) throw new Error('output file is required for binary output')
    return {
      stream: fileOutStream(options.output),
      result: () => {
        throw new Error('binary output does not support result()')
      },
    }
  }
  const stringOS = stringCollector()
  return {
    stream: base91OutStream(stringOS),
    result: stringOS.result,
  }
}

const scaleSVG = (svg: Svg, scale: Pt): Svg => {
  let result: Svg | undefined
  let currentElement: Element
  let currentSegment: PathSegment
  let current = [0, 0] as Pt
  let currentInt = [0, 0] as Pt

  renderSVG(svg, {
    renderBox: (box: Pt) => (result = { xy: [0, 0], wh: mul(box, scale), elements: [] }),
    renderBeginPath: () => (currentElement = { name: 'path', segments: [] }),
    renderBeginSegment: (_: Pt, initial: Pt) => {
      currentSegment = { initial: mul(initial, scale), lineTo: [], closed: true }
      current = currentSegment.initial
      currentInt = round(current)
    },
    renderLineTo: (pt: Pt) => {
      const scaled = mul(pt, scale)
      current = add(current, scaled)
      const nextInt = round(current)
      const d = sub(nextInt, currentInt)
      currentInt = nextInt
      currentSegment.lineTo.push(d)
    },
    renderEndSegment: () => currentElement.segments.push(currentSegment),
    renderEndPath: () => result!.elements.push(currentElement),
  })

  return result!
}

export async function encode(file: string, log: (message: string) => void, options: Options) {
  log('converting svg file to svgr format...')

  const svgText = await Bun.file(file).text()
  log(`file: ${file}, length: ${svgText.length} bytes`)

  const svg = parseSVG(svgText)
  const scale = getRatio(svg.wh, options)
  const scaled = scaleSVG(svg, scale)

  const out = createOutput(options)
  const bitStream = bitOutStream(out.stream)

  encodeSVGR(scaled, bitStream, log)
  bitStream.close()

  if (!options.binary) console.log(out.result())
}
