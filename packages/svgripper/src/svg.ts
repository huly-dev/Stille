//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export type Pt = [x: number, y: number]
export type CID = 'M' | 'm' | 'L' | 'l' | 'Z' | 'z'
export type ExtendedCommand = 'curveto' | 'shorthand'

export type Shorthand = {
  command: 'shorthand'
  controlPoint: Pt
}

export type CurveTo = {
  command: 'curveto'
  controlPoint1: Pt
  controlPoint2: Pt
}

export type Extended = CurveTo | Shorthand

export type PathSegment = {
  initial: Pt // absolute
  lineTo: Pt[] // relative
  extended?: Pt[] // relative
  closed: boolean
}

export type ElementName = 'path'

export type Path = {
  readonly name: 'path'
  readonly segments: PathSegment[]
}

export type Element = Path

export type SVG = {
  readonly xy: Pt
  readonly wh: Pt
  readonly elements: Element[]
}
