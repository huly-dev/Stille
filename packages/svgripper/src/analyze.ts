//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { numberOfBits } from '@huly/bits'
import type { Element, PathSegment, Pt, SVG } from './svg'

export const min = (points: Pt[]) =>
  points.reduce(
    (acc, point) => {
      if (point[0] < acc.minX) acc.minX = point[0]
      if (point[1] < acc.minY) acc.minY = point[1]
      return acc
    },
    { minX: Infinity, minY: Infinity },
  )

export const max = (points: Pt[]) =>
  points.reduce(
    (acc, point) => {
      if (point[0] > acc.maxX) acc.maxX = point[0]
      if (point[1] > acc.maxY) acc.maxY = point[1]
      return acc
    },
    { maxX: -Infinity, maxY: -Infinity },
  )

export const analyze = (points: Pt[]) => {
  const { minX, minY } = min(points)
  const normalized = points.map((point): Pt => [point[0] - minX, point[1] - minY])
  const { maxX, maxY } = max(normalized)

  const bitsX = numberOfBits(maxX)
  const bitsY = numberOfBits(maxY)

  return {
    bitsX,
    bitsY,
    width: maxX,
    height: maxY,
    shiftX: -minX,
    shiftY: -minY,
  }
}

export const analyzeSVG = (svg: SVG) => {
  let totalBits = 0
  let segmentsTotal = 0
  let pointsTotal = 0

  svg.elements.forEach((element) => {
    switch (element.name) {
      case 'path':
        const { segments } = element
        segments.forEach((segment) => {
          segmentsTotal++
          pointsTotal += segment.lineTo.length

          // const analyzed = analyze(segment.lineTo)

          // console.log({ len: commands.length, segmentTotal, bitsX, bitsY, maxX, maxY })
        })
        break
    }
  })

  // console.log({ segmentsTotal, commandsTotal, totalBits, totalBytes: totalBits / 8, totalAscii: totalBits / 7 })
}

// const scalePoints = (points: Pt[], factor: number): Pt[] =>
//   points.map((point) => [point[0] * factor, point[1] * factor])

const scaleSegment =
  (factor: number) =>
  (segment: PathSegment): PathSegment => ({
    initial: [segment.initial[0] * factor, segment.initial[1] * factor],
    final: [segment.final[0] * factor, segment.final[1] * factor],
    lineTo: segment.lineTo.map((point) => [point[0] * factor, point[1] * factor]),
    closed: segment.closed,
  })

export const scaleSVG = (svg: SVG, factor: number): SVG => ({
  viewBox: {
    xy: svg.viewBox.xy, // only [0, 0] allowed for now
    wh: svg.viewBox.wh.map((value) => value * factor) as [number, number],
  },
  elements: svg.elements.map(
    (element): Element => ({
      name: element.name,
      segments: element.segments.map(scaleSegment(factor)),
    }),
  ),
})
