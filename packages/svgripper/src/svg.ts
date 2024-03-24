//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export type Pt = [x: number, y: number]

type C0 = 'Z' | 'z'
type C2 = 'M' | 'm' | 'l'

export type CID = C0 | C2

type Command0 = {
  command: C0
  param?: never
}

type Command2 = {
  command: C2
  param: Pt
}

export type Command = Command0 | Command2

export type ElementName = 'path'

export interface Element<N extends ElementName> {
  name: N
}

export interface Path extends Element<'path'> {
  d: string
}
