import { type Element, type PathSegment, type Pt, type SVG } from './svg'

type F = (pt: Pt) => Pt

export const round = (point: Pt): Pt => [Math.round(point[0]), Math.round(point[1])]
export const mul =
  (x: Pt) =>
  (y: Pt): Pt => [x[0] * y[0], x[1] * y[1]]

export const $ = (...funcs: F[]) => funcs.reduce((acc, f) => (pt) => f(acc(pt)))

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
