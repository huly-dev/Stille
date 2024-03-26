import { $, mapSVG, mul, parseSVG, round, type Pt } from 'svgripper'

type Options = {
  output?: string
  binary?: boolean
  width?: number
  height?: number
}

function getRatio(viewBox: Pt, options: Options): Pt {
  const { width, height } = options
  if (width && height) return [width / viewBox[0], height / viewBox[1]]
  const ratio = width ? width / viewBox[0] : height ? height / viewBox[1] : 1
  return [ratio, ratio]
}

export async function convert(file: string, log: (message: string) => void, options: Options) {
  log('converting svg file to svgr format...')

  const svgText = await Bun.file(file).text()
  log(`file: ${file}, length: ${svgText.length} bytes`)

  const svg = parseSVG(svgText)

  const viewBox = svg.viewBox
  if (!viewBox) throw new Error('SVG file must have viewBox')
  if (viewBox.xy[0] !== 0 || viewBox.xy[1] !== 0) throw new Error('SVG file must have viewBox starting at 0,0')

  const scale = getRatio(viewBox.wh, options)
  const renderBox = round(mul(viewBox.wh)(scale))
  log(`rendering to ${renderBox[0]}x${renderBox[1]} box...`)

  const scaled = mapSVG(svg, $(round, mul(scale)))
}
