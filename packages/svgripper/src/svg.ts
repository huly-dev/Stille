//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export type Pt = [x: number, y: number]

export type CID = 'M' | 'm' | 'L' | 'l' | 'Z' | 'z'

export type CommandName = 'lineto' | 'curveto' | 'shorthand'

export type LineTo = {
  command: 'lineto'
  dest: Pt
}

export type Shorthand = {
  command: 'shorthand'
  dest: Pt
  controlPoint: Pt
}

export type CurveTo = {
  command: 'curveto'
  dest: Pt
  controlPoint: Pt
  controlPoint2: Pt
}

export type Command = LineTo | CurveTo | Shorthand

export type PathSegment = {
  initial: Pt // absolute
  final: Pt // absolute
  commands: Command[] // relative
  closed: boolean
}

export type ElementName = 'path'

export type Path = {
  name: 'path'
  segments: PathSegment[]
}

export type Element = Path

export type ViewBox = {
  xy: Pt
  wh: Pt
}

export type SVG = {
  viewBox: ViewBox
  elements: Element[]
}
