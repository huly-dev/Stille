//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { SAXParser } from 'sax'

import { add, sub } from './math'
import type { Pt } from './types'

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
  value: CID
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
        flushNumber()
        result.push({ type: TokenType.CID, value: c as CID })
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
        throw new Error('Unhandled cahracter ' + d[i])
    }
  }
  return result
}

export const parsePath = (d: Token[]): Path => {
  const result: Path = {
    name: 'path',
    segments: [],
  }

  const iter = () => {
    let i = 0
    return {
      next: () => d[i++],
      unread: () => i--,
    }
  }

  const i = iter()

  const toFloat = (token: Token): number => {
    if (token.type !== TokenType.Number) throw new Error('Expected a number')
    return token.value
  }

  let current: Pt | undefined

  while (true) {
    const initial = i.next()
    if (initial === undefined) return result
    if (initial.type !== TokenType.CID) throw new Error('Expected a command')

    const value = initial.value
    if (value !== 'M' && value !== 'm') throw new Error('Expected a move-to command')

    let relative = value === 'm'
    const x = toFloat(i.next())
    const y = toFloat(i.next())

    if (relative) {
      if (current === undefined) throw new Error('No current point')
      current = add(current, [x, y])
    } else current = [x, y]

    if (current![0] < 0 || current![1] < 0) {
      console.log('Negative', d)
      throw new Error('Negative')
    }

    // let final = [initialX, initialY] // absolute

    const segment: PathSegment = {
      initial: current!, // absolute
      lineTo: [], // relative
      closed: false,
    }

    function push(lineTo: Pt, relative: boolean) {
      if (relative) {
        segment.lineTo.push(lineTo)
        current = add(current!, lineTo)
      } else {
        segment.lineTo.push(sub(lineTo, current!))
        current = lineTo
      }
    }

    let done = false

    while (!done) {
      const next = i.next()
      if (next === undefined) return result

      if (next.type === TokenType.Number) {
        // M continuation -> treat as a lineto
        const x = toFloat(next)
        const y = toFloat(i.next())
        push([x, y], relative)
        continue
      }

      const command = next.value

      switch (command) {
        case 'L':
        case 'l':
          relative = command === 'l'
          const x = toFloat(i.next())
          const y = toFloat(i.next())
          push([x, y], relative)
          break

        case 'Z':
        case 'z':
          segment.closed = true
          done = true
          break

        default:
          throw new Error('Unexpected command ' + command)
      }
    }

    result.segments.push(segment)
  }
}

export function parseSVG(svg: string): Svg {
  const parser = new SAXParser(true)

  let viewBox: number[] | undefined
  const elements: Element[] = []

  parser.onopentag = (node) => {
    switch (node.name) {
      case 'svg':
        const vb = node.attributes['viewbox'] as string
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

export interface SvgRenderer {
  renderBox?: (box: Pt) => void
  renderBeginPath?: () => void
  renderBeginSegment?: (last: Pt, initial: Pt) => void
  renderLineTo?: (pt: Pt) => void
  renderEndSegment?: (closed: boolean) => void
  renderEndPath?: () => void
}

export const renderSVG = (svg: Svg, renderer: SvgRenderer) => {
  renderer.renderBox?.(svg.wh)
  svg.elements.forEach((element) => {
    renderer.renderBeginPath?.()
    let last: Pt = [0, 0]
    element.segments.forEach((segment) => {
      renderer.renderBeginSegment?.(last, segment.initial)
      last = segment.initial
      segment.lineTo.forEach((pt) => {
        renderer.renderLineTo?.(pt)
        last = add(last, pt)
      })
      renderer.renderEndSegment?.(segment.closed)
    })
    renderer.renderEndPath?.()
  })
}
