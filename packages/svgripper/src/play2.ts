import { countFrequencies } from '@huly/bits'
import { analyze, ensureBits, isEqual, scaleSVG } from './analyze'
import { parseSVG } from './parse'
import type { Pt } from './svg'

const svgText = await Bun.file(import.meta.dir + '/../tests/world.svg').text()

const svg = parseSVG(svgText)
const svgInt = scaleSVG(svg, 32768 / 2000)

console.log(isEqual(svg, svgInt))
