import { parseSVG, round, type Pt } from 'svgripper'

type Options = {
  output?: string
  binary?: boolean
  width?: number
  height?: number
}

function getRenderBox(viewBox: Pt, options: Options): Pt {
  const { width, height } = options
  if (width && height) return [width, height]
  if (width) return [width, (viewBox[1] * width) / viewBox[0]]
  if (height) return [(viewBox[0] * height) / viewBox[1], height]
  return viewBox
}

export async function convert(file: string, log: (message: string) => void, options: Options) {
  log('converting svg file to svgr format...')

  const svgText = await Bun.file(file).text()
  log(`file: ${file}, length: ${svgText.length} bytes`)

  const svg = parseSVG(svgText)

  const viewBox = svg.viewBox
  if (!viewBox) throw new Error('SVG file must have viewBox')
  if (viewBox.xy[0] !== 0 || viewBox.xy[1] !== 0) throw new Error('SVG file must have viewBox starting at 0,0')

  const renderBox = round(getRenderBox(viewBox.wh, options))
  log(`rendering to ${renderBox[0]}x${renderBox[1]} box...`)

  const scaled = mapSVG(svg)((pt) => round(mul(renderBox[0] / viewBox.wh[0])(pt)))
}
