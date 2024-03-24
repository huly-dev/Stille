//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { CID, Command } from './svg'

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

export const parse = (d: Token[]): Command[] => {
  const result = [] as Command[]

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

  let lastCommand: CID | undefined = undefined

  const flush = (command: Command) => {
    result.push(command)
    lastCommand = command.command
  }

  const nextCommand = () => {
    const token = i.next()
    if (token === undefined) return undefined
    if (token.type === TokenType.CID) return token.value
    i.unread()
    return lastCommand
  }

  while (true) {
    const command = nextCommand()
    switch (command) {
      case 'M':
      case 'm':
      case 'l':
        const x = toFloat(i.next())
        const y = toFloat(i.next())
        flush({ command, param: [x, y] })
        break

      case 'Z':
      case 'z':
        flush({ command })
        break

      case undefined:
        return result

      default:
        throw new Error('Unexpected command ' + command)
    }
  }
}
