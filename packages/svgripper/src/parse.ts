//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { SAXParser } from 'sax'

import type { CID, Command, Element, Path, PathSegment, SVG } from './svg'

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

  while (true) {
    const initial = i.next()
    if (initial === undefined) return result
    if (initial.type !== TokenType.CID) throw new Error('Expected a command')

    let relative = false

    if (initial.value !== 'M') {
      if (initial.value === 'm') {
        relative = true
      } else throw new Error('Expected a move-to command')
    }

    const initialX = toFloat(i.next())
    const initialY = toFloat(i.next())

    const segment: PathSegment = {
      initial: [initialX, initialY], // absolute
      final: [initialX, initialY], // absolute
      commands: [], // relative
      closed: false,
    }

    function push(command: Command, relative: boolean) {
      if (relative) {
        segment.commands.push(command)
        segment.final = [segment.final[0] + command.dest[0], segment.final[1] + command.dest[1]]
      } else {
        const delta = [command.dest[0] - segment.final[0], command.dest[1] - segment.final[1]]
        segment.commands.push({ command: 'lineto', dest: delta })
        segment.final = command.dest
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
        push({ command: 'lineto', dest: [x, y] }, relative)
        continue
      }

      const command = next.value

      switch (command) {
        case 'L':
        case 'l':
          relative = command === 'l'
          const x = toFloat(i.next())
          const y = toFloat(i.next())
          push({ command: 'lineto', dest: [x, y] }, relative)
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
        console.log('svg', node)
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
    viewBox: {
      xy: [viewBox[0], viewBox[1]],
      wh: [viewBox[2], viewBox[3]],
    },
    elements,
  }
}
