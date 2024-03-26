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

// export function reduceSimilarVectors(vectors: Pt[]): Pt[] {
//   return vectors.reduce((acc: Pt[], current: Pt, index: number) => {
//     if (index === 0) {
//       acc.push(current)
//       return acc
//     }

//     const last = acc[acc.length - 1]
//     if (last[0] === current[0] && last[1] === current[1]) {
//       // If the current vector is the same as the last, add them together
//       acc[acc.length - 1] = [last[0] + current[0], last[1] + current[1]]
//     } else {
//       // Otherwise, push the current vector to the accumulator
//       acc.push(current)
//     }

//     return acc
//   }, [])
// }

const areSameDirection = (a: Pt, b: Pt): boolean => {
  // Check if one of the vectors is a zero vector
  if ((a[0] === 0 && a[1] === 0) || (b[0] === 0 && b[1] === 0)) {
    return a[0] === b[0] && a[1] === b[1]
  }
  // Check for scalar multiples (ignoring negative zero for simplicity)
  return (
    (a[0] === 0 || b[0] === 0 || a[0] / b[0] === b[1] / a[1]) &&
    (a[1] === 0 || b[1] === 0 || a[1] / b[1] === b[0] / a[0]) &&
    (a[0] === 0 || b[0] === 0 || Math.sign(a[0]) === Math.sign(b[0])) &&
    (a[1] === 0 || b[1] === 0 || Math.sign(a[1]) === Math.sign(b[1]))
  )
}

// Function to reduce similar vectors by adding them together
export function reduceSimilarVectors(vectors: Pt[]): Pt[] {
  return vectors.reduce((acc: Pt[], current: Pt) => {
    // If there are no vectors in the accumulator, add the current one
    if (acc.length === 0) {
      return [current]
    }
    const last = acc[acc.length - 1]
    // Check if current and last vector are in the same direction
    if (areSameDirection(last, current)) {
      // If so, add the current vector to the last vector in the accumulator
      acc[acc.length - 1] = [last[0] + current[0], last[1] + current[1]]
    } else {
      // Otherwise, push the current vector to the accumulator
      acc.push(current)
    }
    return acc
  }, [])
}
