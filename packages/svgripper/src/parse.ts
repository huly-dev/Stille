//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { CID } from './svg'

export enum TokenType {
  CID,
  Number,
}

type Token = {
  type: TokenType
  value: CID | number
}

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

// export const xxxx = (d: string, out: (token: CID) => void) => {
//   let currentCommand: CID | undefined = undefined
//   let currentCoords: number[] = []
//   let current: string = ''

//   function flushCoord() {
//     if (current === '') return
//     if (currentCommand) {
//       const coord = parseFloat(current)
//       currentCoords.push(coord)
//       current = ''
//     } else throw new Error('No current command')
//   }

//   function flush(command: CID) {
//     flushCoord()
//     if (currentCommand)
//       out({
//         d,
//         command: currentCommand,
//         coords: currentCoords.reduce((acc, coord, i) => {
//           if (i % 2 === 0) acc.push([coord, currentCoords[i + 1]])
//           return acc
//         }, [] as Coord[]),
//       })
//     currentCommand = command
//     currentCoords = []
//     current = ''
//   }

//   for (let i = 0; i < d.length; i++) {
//     const c = d[i]
//     switch (c) {
//       case 'M':
//       case 'm':
//       case 'l':
//       case 'Z':
//       case 'z':
//         flush(c)
//         break
//       case '0':
//       case '1':
//       case '2':
//       case '3':
//       case '4':
//       case '5':
//       case '6':
//       case '7':
//       case '8':
//       case '9':
//       case '.':
//         current += c
//         break
//       case '-':
//         if (current !== '') {
//           flushCoord()
//           current = '-'
//         } else {
//           current += c
//         }
//         break
//       case ',':
//       case ' ':
//         flushCoord()
//         break
//       default:
//         throw new Error('Unhandled cahracter ' + d[i])
//     }
//   }

//   if (currentCommand) out(currentCommand)
// }
