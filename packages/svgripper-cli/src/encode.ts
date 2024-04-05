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
  let current = [0, 0] as Pt
  let currentInt = [0, 0] as Pt

  return renderSVG(svg, {
    renderBox: (box: Pt): Svg => ({ xy: [0, 0], wh: mul(box, scale), elements: [] }),
    renderBeginPath: (): Element => ({ name: 'path', segments: [] }),
    renderBeginSegment: (_: Pt, initial: Pt) => {
      const segment = { initial: mul(initial, scale), lineTo: [], closed: true }
      current = segment.initial
      currentInt = round(current)
      return segment
    },
    renderLineTo: (pt: Pt, segment: PathSegment) => {
      const scaled = mul(pt, scale)
      current = add(current, scaled)
      const nextInt = round(current)
      const d = sub(nextInt, currentInt)
      currentInt = nextInt
      segment.lineTo.push(d)
      return segment
    },
    renderEndSegment: (_: boolean, element: Element, segment: PathSegment) => {
      element.segments.push(segment)
      return element
    },
    renderEndPath: (svg: Svg, element: Element) => {
      svg.elements.push(element)
      return svg
    },
    renderEndDocument: (svg: Svg) => svg,
  })
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
