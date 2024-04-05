//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • undefined/path.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

export type CID = 'M' | 'm' | 'l' | 'Z' | 'z'

export type Coord = [X: number, Y: number]

export type Command = {
  d: string
  command: CID
  coords: Coord[]
}

export const parsePath = (d: string, out: (command: Command) => void) => {
  let currentCommand: CID | undefined = undefined
  let currentCoords: number[] = []
  let current: string = ''

  function flushCoord() {
    if (current === '') return
    if (currentCommand) {
      const coord = parseFloat(current)
      currentCoords.push(coord)
      current = ''
    } else throw new Error('No current command')
  }

  function flush(command: CID) {
    flushCoord()
    if (currentCommand)
      out({
        d,
        command: currentCommand,
        coords: currentCoords.reduce((acc, coord, i) => {
          if (i % 2 === 0) acc.push([coord, currentCoords[i + 1]])
          return acc
        }, [] as Coord[]),
      })
    currentCommand = command
    currentCoords = []
    current = ''
  }

  for (let i = 0; i < d.length; i++) {
    const c = d[i]
    switch (c) {
      case 'M':
      case 'm':
      case 'l':
      case 'Z':
      case 'z':
        flush(c)
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
        current += c
        break
      case '-':
        if (current !== '') {
          flushCoord()
          current = '-'
        } else {
          current += c
        }
        break
      case ',':
      case ' ':
        flushCoord()
        break
      default:
        throw new Error('Unhandled cahracter ' + d[i])
    }
  }

  if (currentCommand) out(currentCommand)
}
