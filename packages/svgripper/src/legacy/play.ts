//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • undefined/play.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//
import { countFrequencies } from '@huly/bits'
import { analyze, ensureBits, scaleSVG } from './analyze'
import { parseSVG } from './parse'
import type { Pt } from './svg'

const svgText = await Bun.file(import.meta.dir + '/../tests/world.svg').text()

const svgO = parseSVG(svgText)

console.log(1 << 15)

const svg = scaleSVG(svgO, 10)

console.log('elements', svg.elements.length)

const lines = svg.elements.flatMap((element) => element.segments.map((segment) => segment.lineTo))

const analyzeLine = (line: Pt[]) => {
  const analyzed = analyze(line)
  const len = line.length
  const bits = analyzed.bitsX + analyzed.bitsY

  return {
    totalBytes: Math.ceil((len * bits) / 8),
  }
}

// lines.map(analyzeLine).forEach((line) => console.log(line))

const flat = lines.flat()
console.log('total points:', flat.length)

const analyzedFlat = analyze(flat)
console.log(analyzedFlat)
console.log(analyzeLine(flat))

// console.log(flat)

// console.log('NORMALIZED')

// const norm = flat.map((point) => [point[0] - analyzedFlat.centerX, point[1] - analyzedFlat.centerY] as Pt)
// console.log('total points norm:', norm.length)

// const analyzedNorm = analyze(norm)
// console.log(analyzedNorm)
// console.log(analyzeLine(norm))

// console.log(norm)

const norm = flat

const l64 = norm.flatMap((point) => ensureBits(point, 1023, 1023))
console.log('total points 64:', l64.length)
const analyzed64 = analyze(l64)
console.log(analyzed64)
console.log(analyzeLine(l64))

// console.log(l64)

const l32 = norm.flatMap((point) => ensureBits(point, 511, 511))
console.log('total points 32:', l32.length)
const analyzed32 = analyze(l32)
console.log(analyzed32)
console.log(analyzeLine(l32))

const l16 = norm.flatMap((point) => ensureBits(point, 255, 255))
console.log('total points 32:', l16.length)
const analyzed16 = analyze(l16)
console.log(analyzed16)
console.log(analyzeLine(l16))

console.log(
  'freq:',
  countFrequencies(
    l32.flatMap((pt) => pt),
    9,
  ),
)
