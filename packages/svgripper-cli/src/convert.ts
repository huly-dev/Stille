import { getPathsSVG, mapSVG, mul, parseSVG, round, type Pt } from 'svgripper'
import { reduceSimilarVectors, sum } from 'svgripper/src/math'

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
  const renderBox = round(mul(viewBox.wh, scale))
  log(`rendering to ${renderBox[0]}x${renderBox[1]} box...`)

  let floatX = 0
  let floatY = 0

  let intX = 0
  let intY = 0

  const scaled = mapSVG(svg, (pt: Pt): Pt => {
    const scaledX = pt[0] * scale[0]
    const scaledY = pt[1] * scale[1]

    const newX = floatX + scaledX
    const newY = floatY + scaledY

    const newIntX = Math.round(newX)
    const newIntY = Math.round(newY)

    const dx = newIntX - intX
    const dy = newIntY - intY

    // console.log('scaled', scaledX, scaledY, 'd', dx, dy, 'new', newX, newY, 'int', newIntX, newIntY)

    floatX = newX
    floatY = newY
    intX = newIntX
    intY = newIntY

    return [dx, dy]
  })

  const pathScaled = getPathsSVG(scaled).flat()
  log(`${pathScaled.length} coordinates in draw commands`)

  const pathOrignal = getPathsSVG(svg).flat()
  const finalOrignal = sum(pathOrignal)
  const finalScaled = sum(pathScaled)
  log(`verifying final points... original: ${finalOrignal}, rendered: ${finalScaled}`)

  const withoutNoops = pathScaled.filter((pt) => pt[0] !== 0 || pt[1] !== 0)
  log(`removed ${pathScaled.length - withoutNoops.length} noops, ${withoutNoops.length} points remaining`)

  // withoutNoops.forEach((pt) => console.log(`[${pt[0]}, ${pt[1]}],`))

  let reduced = reduceSimilarVectors(withoutNoops)
  log(`reduced to ${reduced.length} points`)
  reduced = reduceSimilarVectors(withoutNoops)
  log(`reduced to ${reduced.length} points`)
  reduced = reduceSimilarVectors(withoutNoops)
  log(`reduced to ${reduced.length} points`)

  reduced.forEach((pt) => console.log(`[${pt[0]}, ${pt[1]}]`))
}
