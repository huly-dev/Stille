import {
  buildHuffmanTree,
  countFrequencies,
  createBitWriteStream,
  createHuffmanEncoder,
  generateHuffmanCodes,
} from '@huly/bits'
import { getPathsSVG, mapSVG, mul, parseSVG, round, type Pt } from 'svgripper'
import { max, min } from 'svgripper/src/analyze'
import { bounds, reduceVectors, sum } from 'svgripper/src/math'

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
  const pathOrignal = getPathsSVG(svg).flat()
  log(`${pathScaled.length} coordinates in draw commands`)

  const finalOrignal = sum(pathOrignal)
  const finalScaled = sum(pathScaled)
  log(`verifying final points... original: ${finalOrignal}, rendered: ${finalScaled}`)

  const { min, box } = bounds(pathScaled)
  log(`bounding box: min ${min}, box ${box}]`)

  // const degree = options.degree
  // const reduced = reduceVectors(pathScaled, degree)
  // log(`reduced to ${reduced.length} points using ${degree} degree similarity`)

  const reduced = pathScaled.filter((pt) => pt[0] !== 0 || pt[1] !== 0)
  log(`reduced to ${reduced.length} points`)

  function compress(points: Pt[]) {
    const { min, box } = bounds(points)
    log(`reduced bounding box: min ${min}, box ${box}]`)
    const alphabet = Math.max(box[0], box[1]) + 1

    const normalized = points.flatMap((pt) => [pt[0] - min[0], pt[1] - min[1]])
    log(`normalized to ${alphabet} symbols in alphabet`)

    const freq = countFrequencies(normalized, alphabet)
    log(`frequencies: ${freq}`)

    const huffmanTree = buildHuffmanTree(freq)
    const codes = generateHuffmanCodes(huffmanTree)

    console.log('codes.length', codes)

    let bytesWritten = 0

    const result: number[] = []

    const bitWriteStream = createBitWriteStream(16, (x) => {
      result.push(x & 0xff)
      result.push((x >> 8) & 0xff)
      bytesWritten++
    })

    const huffmanEncoder = createHuffmanEncoder(codes, bitWriteStream)
    normalized.forEach((point) => huffmanEncoder(point))
    bitWriteStream.flushBits()

    console.log({ bytesWritten: bytesWritten * 2 })
  }

  compress(reduced)
}
