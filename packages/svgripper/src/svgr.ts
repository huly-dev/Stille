//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • core/svgr.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import {
    frequencyTable,
    generateHuffmanCodes,
    huffmanInStream,
    huffmanOutStream,
    numberOfBits,
    type BitInStream,
    type BitOutStream,
    type FrequencyTable,
} from '@huly/bits'
import { add } from './math'
import { toVector } from './path'
import { pointInStream, readAbsolute } from './point'
import { renderSVG, type Svg } from './svg'
import type { Pt } from './types'

const FREQUENCY_BITS = 4
const PARAM_BITS = 13

const writeSignedBits = (out: BitOutStream, value: number, bits: number) => {
  if (value < 0) {
    out.writeBits(1, 1)
    out.writeBits(-value, bits - 1)
  } else {
    out.writeBits(0, 1)
    out.writeBits(value, bits - 1)
  }
}

export const writeFrequencyTable = (out: BitOutStream, table: FrequencyTable) => {
  const frequencies = table.frequencies
  const maxFreq = Math.max(...frequencies)
  const bitsPerFrequency = numberOfBits(maxFreq)

  const compressedBits = Math.ceil(bitsPerFrequency / 2)
  const freq2 = frequencies.flatMap((f) => [f >> compressedBits, f & ((1 << compressedBits) - 1)])

  console.log('bits per frequency', compressedBits)

  out.writeBits(bitsPerFrequency, FREQUENCY_BITS)
  writeSignedBits(out, table.indexOffset, PARAM_BITS)
  out.writeBits(frequencies.length, PARAM_BITS)

  console.log('freq2', freq2)

  const table2 = frequencyTable(freq2)
  console.log('table2', table2)
  const maxFreq2 = Math.max(...table2.frequencies)
  const bitsPerFrequency2 = numberOfBits(maxFreq2)
  out.writeBits(bitsPerFrequency2, FREQUENCY_BITS)

  const codes = generateHuffmanCodes(table2)
  console.log(codes)
  const huffman = huffmanOutStream(codes, out)

  freq2.forEach(huffman.writeSymbol)
}

export const readFrequencyTable = (input: BitInStream): FrequencyTable => {
  const bitsPerFrequency = input.readBits(FREQUENCY_BITS)
  const indexOffset = input.readBits(PARAM_BITS)
  const length = input.readBits(PARAM_BITS)
  return {
    frequencies: Array.from({ length }, () => input.readBits(bitsPerFrequency)),
    indexOffset,
  }
}

///

export const encodeSVGR = (svg: Svg, out: BitOutStream, log: (message: string) => void) => {
  const data = renderSVG(svg, {
    box: () => ({ result: [] as number[], from: [0, 0] }),
    beginPath: (ctx) => ({ result: [] as number[], from: ctx.from }),
    pathCommand: (ctx, c) => {
      ctx.result.push(...toVector(c))
      return ctx
    },
    endPath: (svg, ctx) => {
      svg.result.push(...ctx.result)
      return svg
    },
    endDocument: (svg) => svg.result,
  })

  console.log('data', data)

  const linkedIn = 'R*`3*d8tc}i]yy2u_/(`M1tA+/>@F2ul:2UD$k/I?nOawDk3h)fhQzjX_#-b/umRTOXvWs~n([m@8{b60sN43J!^=k]W]PiYqhU3EOhCKX,*BoA1__?*RggUgBmeB10.c>X3|%^G7'

  out.writeBits(svg.wh[0], PARAM_BITS)
  out.writeBits(svg.wh[1], PARAM_BITS)

  const table = frequencyTable(data)
  log(`data: symbols ${table.frequencies.length}, min ${table.indexOffset}`)
  console.log('table', table)

  writeFrequencyTable(out, table)

  data
    .reduce(
      (out, symbol) => {
        out.writeSymbol(symbol)
        return out
      },
      huffmanOutStream(generateHuffmanCodes(table), out),
    )
    .close()
}

export const decodeSVGR = (input: BitInStream, log: (message: string) => void): Svg => {
  const frequencyTable = readFrequencyTable(input)
  const codes = generateHuffmanCodes(frequencyTable)

  const viewBox = readAbsolute(input)
  const min = readAbsolute(input)
  log(`view box: ${viewBox}, min: ${min}`)

  const pointIn = pointInStream(min, huffmanInStream(codes, input))
  const segments = []
  let current: Pt = [0, 0]

  while (true) {
    if (pointIn.readBits(1) === 0) break
    let initial = pointIn.readAny(current)
    const lineTo = []
    while (true) {
      const pt = pointIn.readRelative()
      if (pt[0] === 0 && pt[1] === 0) break
      lineTo.push(pt)
      current = add(initial, pt)
    }
    const segment = { initial, lineTo, closed: true }
    segments.push(segment)
  }

  return {
    xy: [0, 0] as Pt,
    wh: viewBox,
    elements: [{ name: 'path', segments }],
  }
}
