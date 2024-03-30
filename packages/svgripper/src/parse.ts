//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { SAXParser } from 'sax'

import { add, sub } from './math'
import type { CID, Element, Path, PathSegment, Pt, SVG } from './svg'

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

    if (current[0] < 0 || current[1] < 0) {
      console.log('Negative', d)
      throw new Error('Negative')
    }

    // let final = [initialX, initialY] // absolute

    const segment: PathSegment = {
      initial: current, // absolute
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

export function parseSVG(svg: string): SVG {
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

// export const mapSVG = (svg: SVG, f: (pt: Pt) => Pt) => ({
//   viewBox: {
//     xy: f(svg.xy), // only 0 allowed for now
//     wh: f(svg.wh),
//   },
//   elements: svg.elements.map(
//     (element): Element => ({
//       name: element.name,
//       segments: element.segments.map(
//         (segment: PathSegment): PathSegment => ({
//           initial: f(segment.initial),
//           lineTo: segment.lineTo.map(f),
//           closed: segment.closed,
//         }),
//       ),
//     }),
//   ),
// })

// export const getSegments = (svg: SVG) =>
//   svg.elements.map((element) => element.segments.map((segment) => segment.lineTo))
