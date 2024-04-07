//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • core/svg.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { SAXParser } from 'sax'

import { mul, round } from './math'
import {
  apply,
  applyFunction,
  create,
  lineTo,
  toAbsolute,
  toRelative,
  toString,
  type Cid,
  type Command,
  type PathData,
} from './path'
import type { Pt } from './types'

export type ElementName = 'path'

export type Path = {
  readonly name: 'path'
  readonly d: PathData
}

export type Element = Path

export type Svg = {
  readonly xy: Pt
  readonly wh: Pt
  readonly elements: Element[]
}

export enum TokenType {
  CID,
  Number,
}

type TokenNumber = {
  type: TokenType.Number
  value: number
}

type TokenCID = {
  type: TokenType.CID
  value: Cid
  relative: boolean
}

type Token = TokenNumber | TokenCID

export const tokenize = (d: string): Token[] => {
  const result: Token[] = []

  let currentNumber: string = ''

  const flushNumber = () => {
    if (currentNumber !== '') {
      result.push({ type: TokenType.Number, value: parseFloat(currentNumber) })
      currentNumber = ''
    }
  }

  for (let i = 0; i < d.length; i++) {
    const c = d[i]
    switch (c) {
      case 'M':
      case 'm':
      case 'l':
      case 'Z':
      case 'z':
      case 'C':
      case 'c':
      case 'S':
      case 's':
      case 'Q':
      case 'q':
      case 'T':
      case 't':
      case 'A':
      case 'a':
        flushNumber()
        const lowerCase = c.toLowerCase()
        result.push({ type: TokenType.CID, value: lowerCase as Cid, relative: c === lowerCase })
        break
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '.':
        currentNumber += c
        break
      case '-':
        if (currentNumber !== '') {
          flushNumber()
          currentNumber = '-'
        } else currentNumber += c
        break
      case ',':
      case ' ':
        flushNumber()
        break
      default:
        throw new Error('Unhandled character ' + d[i])
    }
  }
  return result
}

export const parsePath = (d: Token[]): Path => {
  let i = 0
  const next = () => d[i++]
  const val = (t: Token): number => {
    if (t.type !== TokenType.Number) throw new Error('Expected number')
    return t.value
  }
  const nextVal = (): number => val(next())

  let relative = false
  const path: PathData = []

  while (true) {
    const t = next()
    if (t === undefined) break

    if (t.type === TokenType.Number)
      path.push(lineTo(relative, [val(t), nextVal()])) // pure coordinates -> treat as a lineto
    else {
      relative = t.relative
      path.push(create(t.value, relative, nextVal))
    }
  }
  return { name: 'path', d: path }
}

export function parseSVG(svg: string): Svg {
  const parser = new SAXParser(true)

  let viewBox: number[] | undefined
  const elements: Element[] = []

  parser.onopentag = (node) => {
    switch (node.name) {
      case 'svg':
        const vb = node.attributes['viewBox'] as string
        viewBox = vb.split(' ').map((v) => parseFloat(v))
        break
      case 'path':
        const d = node.attributes['d'] as string
        const tokens = tokenize(d)
        const path = parsePath(tokens)
        elements.push(path)
        break
    }
  }

  parser.write(svg).close()

  if (viewBox === undefined) throw new Error('No viewBox found')

  return {
    xy: [viewBox[0], viewBox[1]],
    wh: [viewBox[2], viewBox[3]],
    elements,
  }
}

type RenderContext<E> = {
  from: Pt
  result: E
}

export interface SvgRenderer<S, E> {
  box: (box: Pt) => RenderContext<S>
  beginPath: (ctx: RenderContext<S>) => RenderContext<E>
  pathCommand: (ctx: RenderContext<E>, c: Command<Cid>) => RenderContext<E>
  endPath: (svg: RenderContext<S>, ctx: RenderContext<E>) => RenderContext<S>
  endDocument: (svg: RenderContext<S>) => S
}

export const renderSVG = <S, E>(svg: Svg, renderer: SvgRenderer<S, E>): S =>
  renderer.endDocument(
    svg.elements.reduce(
      (ctx, path) => renderer.endPath(ctx, path.d.reduce(renderer.pathCommand, renderer.beginPath(ctx))),
      renderer.box(svg.wh),
    ),
  )

export const generateSVG = (svg: Svg): string =>
  renderSVG(svg, {
    box: (box) => ({ result: `<svg viewBox="0 0 ${box[0]} ${box[1]}">`, from: [0, 0] }),
    beginPath: (ctx) => ({ result: '<path d="', from: ctx.from }),
    pathCommand: (ctx, c) => ({ result: ctx.result + toString(c), from: apply(c, ctx.from) }),
    endPath: (svg, ctx) => ({ result: svg.result + ctx.result + '" />', from: ctx.from }),
    endDocument: (svg) => svg.result + '</svg>',
  })

export const scaleSVG = (svg: Svg, scale: Pt) =>
  renderSVG(svg, {
    box: (box: Pt) => ({ result: { xy: [0, 0], wh: mul(box, scale), elements: [] } as Svg, from: [0, 0] }),
    beginPath: (ctx) => ({ result: [] as PathData, from: ctx.from }),
    pathCommand: (ctx, c) => {
      const abs = toAbsolute(c, ctx.from)
      const scaled = applyFunction(abs, (p) => mul(p, scale))
      ctx.from = apply(c, ctx.from)
      ctx.result.push(applyFunction(scaled, round))
      return ctx
    },
    endPath: (svg, ctx) => {
      svg.result.elements.push({ name: 'path', d: ctx.result })
      return svg
    },
    endDocument: (svg) => svg.result,
  })

// export const toAbsoluteSVG = (svg: Svg) =>
//   renderSVG(svg, {
//     box: (box: Pt) => ({ result: { xy: [0, 0], wh: box, elements: [] } as Svg, from: [0, 0] }),
//     beginPath: (ctx) => ({ result: [] as PathData, from: ctx.from }),
//     pathCommand: (ctx, c) => {
//       const abs = toAbsolute(c, ctx.from)
//       ctx.from = apply(abs, ctx.from)
//       ctx.result.push(abs)
//       return ctx
//     },
//     endPath: (svg, ctx) => {
//       svg.result.elements.push({ name: 'path', d: ctx.result })
//       return svg
//     },
//     endDocument: (svg) => svg.result,
//   })

export const toRelativeSVG = (svg: Svg) =>
  renderSVG(svg, {
    box: (box: Pt) => ({ result: { xy: [0, 0], wh: box, elements: [] } as Svg, from: [0, 0] }),
    beginPath: (ctx) => ({ result: [] as PathData, from: ctx.from }),
    pathCommand: (ctx, c) => {
      const rel = toRelative(c, ctx.from)
      ctx.from = apply(rel, ctx.from)
      ctx.result.push(rel)
      return ctx
    },
    endPath: (svg, ctx) => {
      svg.result.elements.push({ name: 'path', d: ctx.result })
      return svg
    },
    endDocument: (svg) => svg.result,
  })
