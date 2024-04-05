//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • undefined/analyzer.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { SAXParser } from 'sax'

import { parsePath, type Command, type Coord } from './path'

export const minmax = (values: Coord[]) =>
  values.reduce(
    (acc, value) => {
      if (value[0] < acc.minX) acc.minX = value[0]
      if (value[0] > acc.maxX) acc.maxX = value[0]
      if (value[1] < acc.minY) acc.minY = value[1]
      if (value[1] > acc.maxY) acc.maxY = value[1]
      return acc
    },
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )

export const scale = (values: Coord[], factorX: number, factorY: number) =>
  values.map(([x, y]) => [x * factorX, y * factorY] as Coord)

export const extractComands = (svg: string) => {
  const absolute: Command[] = []
  const relative: Command[] = []

  let viewbox: string | undefined

  const parser = new SAXParser(true)

  parser.onopentag = (node) => {
    switch (node.name) {
      case 'svg':
        console.log('svg', node)
        viewbox = node.attributes['viewbox'] as string
        break
      case 'path':
        const d = node.attributes['d'] as string
        // console.log('path', d)
        parsePath(d, (command) => {
          // console.log('command', command)
          if ('M'.indexOf(command.command) != -1) absolute.push(command)
          else if ('ml'.indexOf(command.command) != -1) relative.push(command)
        })
        break
    }
  }

  parser.write(svg).close()

  return { viewbox, absolute, relative }
}
