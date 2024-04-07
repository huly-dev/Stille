//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//   - core/path.ts
//
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { sub } from './math'
import type { Pt } from './types'

export type Cid = 'l' | 'm' | 'z' | 'c' | 's' | 'q' | 't' | 'a'

const cmd: { [K in Cid]: number } = { l: 0, m: 1, z: -1, c: 2, s: -2, q: 3, t: -3, a: 4 }

export abstract class Command<T extends Cid> {
  constructor(
    readonly command: T,
    readonly relative: boolean,
  ) {}
  abstract transform(f: (p: Pt) => Pt, makeRelative: boolean): Command<T>
  abstract toVector(): number[]
  toRelative(from: Pt): Command<T> {
    return this.relative ? this : this.transform((p) => sub(p, from), true)
  }
}

class CoordinatePair<T extends Cid> extends Command<T> {
  constructor(
    command: T,
    relative: boolean,
    readonly xy: Pt,
  ) {
    super(command, relative)
  }
  transform(f: (p: Pt) => Pt, makeRelative: boolean): CoordinatePair<T> {
    return this.constructor(this.command, makeRelative || this.relative, f(this.xy))
  }
  toVector(): number[] {
    if (this.relative) return [cmd[this.command], this.xy[0], this.xy[1]]
    throw new Error('Must transform to relative first.')
  }
}

export class LineTo extends CoordinatePair<'l'> {
  constructor(absolute: boolean, xy: Pt) {
    super('l', absolute, xy)
  }
}

export class MoveTo extends CoordinatePair<'m'> {
  constructor(absolute: boolean, xy: Pt) {
    super('m', absolute, xy)
  }
}

export class ClosePath extends Command<'z'> {
  private constructor() {
    super('z', false)
  }
  static readonly z = new ClosePath()
  transform(): ClosePath {
    return ClosePath.z
  }
  toVector(): number[] {
    return [cmd[this.command]]
  }
}

export class CurveTo extends Command<'c'> {
  constructor(
    relative: boolean,
    readonly xy1: Pt,
    readonly xy2: Pt,
    readonly xy: Pt,
  ) {
    super('c', relative)
  }
  transform(f: (p: Pt) => Pt, makeRelative: boolean): CurveTo {
    return new CurveTo(this.relative || makeRelative, f(this.xy1), f(this.xy2), f(this.xy))
  }
  toVector(): number[] {
    if (this.relative)
      return [cmd[this.command], this.xy1[0], this.xy1[1], this.xy2[0], this.xy2[1], this.xy[0], this.xy[1]]
    throw new Error('Must transform to relative first.')
  }
}

export class SmoothCurveTo extends Command<'s'> {
  constructor(
    relative: boolean,
    readonly xy2: Pt,
    readonly xy: Pt,
  ) {
    super('s', relative)
  }
  transform(f: (p: Pt) => Pt, makeRelative: boolean): SmoothCurveTo {
    return new SmoothCurveTo(this.relative || makeRelative, f(this.xy2), f(this.xy))
  }
  toVector(): number[] {
    return [cmd[this.command], this.xy2[0], this.xy2[1], this.xy[0], this.xy[1]]
  }
}

export class QuadraticBezierCurveTo extends Command<'q'> {
  constructor(
    relative: boolean,
    readonly xy1: Pt,
    readonly xy: Pt,
  ) {
    super('q', relative)
  }
  transform(f: (p: Pt) => Pt, makeRelative: boolean): QuadraticBezierCurveTo {
    return new QuadraticBezierCurveTo(this.relative || makeRelative, f(this.xy1), f(this.xy))
  }
  toVector(): number[] {
    return [cmd[this.command], this.xy1[0], this.xy1[1], this.xy[0], this.xy[1]]
  }
}

export class SmoothQuadraticBezierCurveTo extends CoordinatePair<'t'> {
  constructor(absolute: boolean, xy: Pt) {
    super('t', absolute, xy)
  }
}

export class EllipticalArc extends Command<'a'> {
  constructor(
    relative: boolean,
    readonly radii: Pt,
    readonly xRotation: number,
    readonly largeArcFlag: 0 | 1,
    readonly sweepFlag: 0 | 1,
    readonly xy: Pt,
  ) {
    super('a', relative)
  }
  transform(f: (p: Pt) => Pt, makeRelative: boolean): EllipticalArc {
    return new EllipticalArc(
      this.relative || makeRelative,
      f(this.radii),
      this.xRotation,
      this.largeArcFlag,
      this.sweepFlag,
      f(this.xy),
    )
  }
  toVector(): number[] {
    return [
      cmd[this.command],
      this.radii[0],
      this.radii[1],
      this.xRotation,
      this.largeArcFlag,
      this.sweepFlag,
      this.xy[0],
      this.xy[1],
    ]
  }
}

export type PathData = Command<Cid>[]
