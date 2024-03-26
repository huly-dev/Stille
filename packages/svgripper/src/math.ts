import { type Element, type PathSegment, type Pt, type SVG } from './svg'

type F = (pt: Pt) => Pt

export const round = (point: Pt): Pt => [Math.round(point[0]), Math.round(point[1])]
export const mul = (x: Pt, y: Pt): Pt => [x[0] * y[0], x[1] * y[1]]

export const sum = (points: Pt[]): Pt => points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]])

export const mapSVG = (svg: SVG, f: F): SVG => ({
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
