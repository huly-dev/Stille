//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//   - core/path.ts
//
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { add, sub } from './math'
import type { Pt } from './types'

export type Cid = 'l' | 'm' | 'z' | 'c' | 's' | 'q' | 't' | 'a'

export interface Command<T extends Cid> {
  readonly command: T
  readonly relative: boolean
  readonly xy: Pt
}

export type PathData = Command<Cid>[]

interface LineTo extends Command<'l'> {
  readonly command: 'l'
}

export const lineTo = (relative: boolean, xy: Pt): LineTo => ({ command: 'l', relative, xy })

interface MoveTo extends Command<'m'> {
  readonly command: 'm'
}

const moveTo = (relative: boolean, xy: Pt): MoveTo => ({ command: 'm', relative, xy })

interface ClosePath extends Command<'z'> {
  readonly command: 'z'
}

const closePath = (relative: boolean, xy?: Pt): ClosePath => ({ command: 'z', relative, xy: xy || [0, 0] })

interface CurveTo extends Command<'c'> {
  readonly command: 'c'
  readonly xy1: Pt
  readonly xy2: Pt
}

const curveTo = (relative: boolean, xy1: Pt, xy2: Pt, xy: Pt): CurveTo => ({ command: 'c', relative, xy1, xy2, xy })

interface SmoothCurveTo extends Command<'s'> {
  readonly command: 's'
  readonly xy2: Pt
}

const smoothCurveTo = (relative: boolean, xy2: Pt, xy: Pt): SmoothCurveTo => ({ command: 's', relative, xy2, xy })

interface QuadraticCurveTo extends Command<'q'> {
  readonly command: 'q'
  readonly xy1: Pt
}

const quadraticCurveTo = (relative: boolean, xy1: Pt, xy: Pt): QuadraticCurveTo => ({ command: 'q', relative, xy1, xy })

interface SmoothQuadraticCurveTo extends Command<'t'> {
  readonly command: 't'
}

const smoothQuadraticCurveTo = (relative: boolean, xy: Pt): SmoothQuadraticCurveTo => ({ command: 't', relative, xy })

interface EllipticalArc extends Command<'a'> {
  readonly command: 'a'
  readonly radii: Pt
  readonly rotation: number
  readonly largeArc: boolean
  readonly sweep: boolean
}

const ellipticalArc = (
  relative: boolean,
  radii: Pt,
  rotation: number,
  largeArc: boolean,
  sweep: boolean,
  xy: Pt,
): EllipticalArc => ({
  command: 'a',
  relative,
  radii,
  rotation,
  largeArc,
  sweep,
  xy,
})

type CommandMap = {
  l: LineTo
  m: MoveTo
  z: ClosePath
  c: CurveTo
  s: SmoothCurveTo
  q: QuadraticCurveTo
  t: SmoothQuadraticCurveTo
  a: EllipticalArc
}

type TransformFunction<K extends Cid> = (c: CommandMap[K], f: (p: Pt) => Pt, flip: boolean) => Command<K>

const transform: { [K in Cid]: TransformFunction<K> } = {
  l: (c, f, m) => lineTo(c.relative !== m, f(c.xy)),
  m: (c, f, m) => moveTo(c.relative !== m, f(c.xy)),
  z: (c, f, m) => closePath(c.relative !== m, f(c.xy)),
  c: (c, f, m) => curveTo(c.relative !== m, f(c.xy1), f(c.xy2), f(c.xy)),
  s: (c, f, m) => smoothCurveTo(c.relative !== m, f(c.xy2), f(c.xy)),
  q: (c, f, m) => quadraticCurveTo(c.relative !== m, f(c.xy1), f(c.xy)),
  t: (c, f, m) => smoothQuadraticCurveTo(c.relative !== m, f(c.xy)),
  a: (c, f, m) => ellipticalArc(c.relative !== m, f(c.radii), c.rotation, c.largeArc, c.sweep, f(c.xy)),
}

export const applyFunction = <K extends Cid>(c: Command<K>, f: (p: Pt) => Pt): Command<K> =>
  transform[c.command](c as unknown as CommandMap[K], f, false)

export const toRelative = <K extends Cid>(c: Command<K>, from: Pt): Command<K> =>
  c.relative ? c : transform[c.command](c as unknown as CommandMap[K], (pt) => sub(pt, from), true)

export const toAbsolute = <K extends Cid>(c: Command<K>, from: Pt): Command<K> =>
  c.relative ? transform[c.command](c as unknown as CommandMap[K], (pt) => add(pt, from), true) : c

type CreateFunction<K extends Cid> = (relative: boolean, next: () => number) => CommandMap[K]

const point = (next: () => number): Pt => [next(), next()]

const ctors: { [K in Cid]: CreateFunction<K> } = {
  l: (relative, next) => lineTo(relative, point(next)),
  m: (relative, next) => moveTo(relative, point(next)),
  z: (relative) => closePath(relative),
  c: (relative, next) => curveTo(relative, point(next), point(next), point(next)),
  s: (relative, next) => smoothCurveTo(relative, point(next), point(next)),
  q: (relative, next) => quadraticCurveTo(relative, point(next), point(next)),
  t: (relative, next) => smoothQuadraticCurveTo(relative, point(next)),
  a: (relative, next) => ellipticalArc(relative, point(next), next(), !!next(), !!next(), point(next)),
}

export const create = <K extends Cid>(cid: K, relative: boolean, next: () => number): CommandMap[K] =>
  ctors[cid](relative, next)

type ToVectorFunction<K extends Cid> = (c: CommandMap[K]) => number[]

const argsToVector: { [K in Cid]: ToVectorFunction<K> } = {
  l: (c) => [...c.xy],
  m: (c) => [...c.xy],
  z: () => [],
  c: (c) => [...c.xy1, ...c.xy2, ...c.xy],
  s: (c) => [...c.xy2, ...c.xy],
  q: (c) => [...c.xy1, ...c.xy],
  t: (c) => [...c.xy],
  a: (c) => [...c.radii, c.rotation, c.largeArc ? 1 : 0, c.sweep ? 1 : 0, ...c.xy],
}

export const toVectorArgs = <K extends Cid>(c: CommandMap[K]): number[] => argsToVector[c.command as K](c)

const toStringFirst = (n: number): string => n.toFixed(0)
const toStringNext = (n: number): string => (n >= 0 ? ',' : '') + n.toFixed(0)

export const toString = <K extends Cid>(c: Command<K>): string => {
  const k = c.command as K
  const cmd = k === 'l' ? '' : c.relative ? k : k.toUpperCase()
  const args = argsToVector[k](c as unknown as CommandMap[K])
    .map((n, i) => (i === 0 && k !== 'l' ? toStringFirst : toStringNext)(n))
    .join('')
  return cmd + args
}

export const apply = (c: Command<Cid>, from: Pt) => (c.relative ? add(from, c.xy) : c.xy)

const cmd: { [K in Cid]: number } = { l: 0, m: 1, z: -1, c: 2, s: -2, q: 3, t: -3, a: 4 }
