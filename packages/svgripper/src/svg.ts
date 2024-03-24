//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export type Pt = [x: number, y: number]

export type CID = 'M' | 'm' | 'l' | 'Z' | 'z'

export interface Command<I extends CID, T> {
  command: I
  param: T
}

export interface CommandPt<I extends CID> extends Command<I, Pt> {
  point: Pt
}

export type ElementName = 'path'

export interface Element<N extends ElementName> {
  name: N
}

export interface Path extends Element<'path'> {
  d: string
}
