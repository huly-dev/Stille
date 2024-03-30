//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { type Element, type PathSegment, type Pt, type SVG } from './svg'

type F = (pt: Pt) => Pt

export const round = (point: Pt): Pt => [Math.round(point[0]), Math.round(point[1])]
export const mul = (x: Pt, y: Pt): Pt => [x[0] * y[0], x[1] * y[1]]
export const add = (x: Pt, y: Pt): Pt => [x[0] + y[0], x[1] + y[1]]
export const sub = (x: Pt, y: Pt): Pt => [x[0] - y[0], x[1] - y[1]]

export const sum = (points: Pt[]): Pt => points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]])

export const mapSVG = (svg: SVG, f: F): SVG => ({
  xy: f(svg.xy),
  wh: f(svg.wh),
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

const k = 180 / Math.PI

export function reduceVectors(vectors: Pt[], sameAngle: number): Pt[] {
  const result: Pt[] = []

  let currentVector: Pt | undefined

  for (const vector of vectors) {
    if (vector[0] === 0 && vector[1] === 0) continue
    if (currentVector === undefined) {
      currentVector = vector
    } else {
      const currentAngle = Math.atan2(currentVector[1], currentVector[0])
      const angle = Math.atan2(vector[1], vector[0])
      const diff = Math.abs(angle - currentAngle) * k
      if (diff < sameAngle) {
        currentVector = [currentVector[0] + vector[0], currentVector[1] + vector[1]]
      } else {
        result.push(currentVector)
        currentVector = vector
      }
    }
  }

  if (currentVector !== undefined) result.push(currentVector)

  return result
}

export const bounds = (points: Pt[]) => {
  const { minX, minY, maxX, maxY } = points.reduce(
    (acc, point) => {
      if (point[0] > acc.maxX) acc.maxX = point[0]
      if (point[1] > acc.maxY) acc.maxY = point[1]
      if (point[0] < acc.minX) acc.minX = point[0]
      if (point[1] < acc.minY) acc.minY = point[1]
      return acc
    },
    { maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity },
  )
  return {
    min: [minX, minY] as Pt,
    box: [maxX - minX, maxY - minY] as Pt,
  }
}
