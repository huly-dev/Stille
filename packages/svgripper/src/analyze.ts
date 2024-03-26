//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { numberOfBits } from '@huly/bits'
import { mul, round } from './math'
import type { Element, PathSegment, Pt, SVG } from './svg'

////

export const mapSVG = (svg: SVG) => (f: (pt: Pt) => Pt) => ({
  viewBox: {
    xy: f(svg.viewBox.xy), // only 0 allowed for now
    wh: f(svg.viewBox.wh),
  },
  elements: svg.elements.map(
    (element): Element => ({
      name: element.name,
      segments: element.segments.map(
        (segment: PathSegment): PathSegment => ({
          initial: f(segment.initial),
          lineTo: segment.lineTo.map(f),
          closed: segment.closed,
        }),
      ),
    }),
  ),
})

export const scaleSVG = (svg: SVG, factor: number): SVG => mapSVG(svg, mul(factor))
export const roundSVG = (svg: SVG): SVG => mapSVG(svg, round)

////

const abs = (points: Pt[]) => points.map((point): Pt => [Math.abs(point[0]), Math.abs(point[1])])

export const max = (points: Pt[]) =>
  points.reduce(
    (acc, point) => {
      if (point[0] > acc.maxX) acc.maxX = point[0]
      if (point[1] > acc.maxY) acc.maxY = point[1]
      return acc
    },
    { maxX: -Infinity, maxY: -Infinity },
  )

export const min = (points: Pt[]) =>
  points.reduce(
    (acc, point) => {
      if (point[0] < acc.minX) acc.minX = point[0]
      if (point[1] < acc.minY) acc.minY = point[1]
      return acc
    },
    { minX: Infinity, minY: Infinity },
  )

export const analyze = (points: Pt[]) => {
  // const { minX, minY } = min(points)
  const { maxX, maxY } = max(abs(points))

  const bitsX = numberOfBits(maxX) + 1 // sign
  const bitsY = numberOfBits(maxY) + 1 // sign

  return {
    maxX,
    maxY,
    bitsX,
    bitsY,
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

// const scaleSegment =
//   (factor: number) =>
//   (segment: PathSegment): PathSegment => ({
//     initial: [segment.initial[0] * factor, segment.initial[1] * factor],
//     lineTo: segment.lineTo.map((point) => [point[0] * factor, point[1] * factor]),
//     closed: segment.closed,
//   })

const splitPoint = (point: Pt): [left: Pt, right: Pt] => {
  const halfX = Math.round(point[0] / 2)
  const halfY = Math.round(point[1] / 2)
  return [
    [halfX, halfY],
    [point[0] - halfX, point[1] - halfY],
  ]
}

export const extendPath = (min: Pt, max: Pt): ((point: Pt) => Pt[]) => {
  const ensureMax = (point: Pt): Pt[] =>
    point[0] > max[0] || point[0] < min[0] || point[1] > max[1] || point[1] < min[1]
      ? splitPoint(point).flatMap(ensureMax)
      : [point]

  return ensureMax
}

// export const ensureBits = (point: Pt, maxX: number, maxY: number): Pt[] =>
//   point[0] > maxX || point[0] < -maxX || point[1] > maxY || point[1] < -maxY
//     ? splitPoint(point).flatMap((point) => ensureBits(point, maxX, maxY))
//     : [point]

// export const allPaths = (svg: SVG) => svg.elements.map((element) => element.segments.map((segment) => segment.lineTo))

export const allPaths = (svg: SVG) =>
  svg.elements.flatMap((element) => element.segments.map((segment) => segment.lineTo))

export const sum = (points: Pt[]): Pt => points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]])

export const isEqual = (a: SVG, b: SVG): boolean => {
  const linesA = allPaths(a).flat()
  console.log(linesA.length, linesA[100])
  const linesB = allPaths(b).flat()
  console.log(linesB.length, linesB[100])
  const sumA = sum(allPaths(a).flat())
  const sumB = sum(allPaths(b).flat())
  console.log({ sumA, sumB })
  return sumA[0] === sumB[0] && sumA[1] === sumB[1]
}
