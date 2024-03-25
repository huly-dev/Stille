import { countFrequencies, numberOfBits } from '@huly/bits'
import { allPaths, extendPath, max, min, roundSVG, scaleSVG, sum } from './analyze'
import { parseSVG } from './parse'
import type { Pt } from './svg'

const svgText = await Bun.file(import.meta.dir + '/../tests/world.svg').text()

const svg = parseSVG(svgText)
const svgInt = roundSVG(scaleSVG(svg, 20000 / 2000))

const svgLines = allPaths(svg).flat()
console.log(svgLines.length, svgLines[100])

const intLines = allPaths(svgInt).flat()
console.log(intLines.length, intLines[100])

const sumSvg = sum(svgLines)
const sumInt = sum(intLines)

console.log({ sumSvg, sumInt })

function countBytes(max: number) {
  const int2Lines = intLines.flatMap(extendPath([-max, -max], [max - 1, max - 1]))
  const verify = sum(int2Lines)
  const length = int2Lines.length
  const bits = numberOfBits(max)
  const size = Math.ceil((length * bits) / 8)

  console.log({ max, verify, length, bits, size })
  return int2Lines
}

countBytes(256)
countBytes(128)
const i64 = countBytes(64)
countBytes(32)
countBytes(16)

const uint = i64.map((point): Pt => [point[0] + 64, point[1] + 64])
console.log(max(uint), min(uint))

const freq = countFrequencies(uint.flat(), 7)
console.log(freq, freq.length)

console.log(
  'non zero',
  freq.reduce((acc, f) => acc + (f > 0 ? 1 : 0), 0),
)