//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { SAXParser } from 'sax'

import { parsePath } from './path'

export const minMax = (values: number[]) =>
  values.reduce(
    (acc, value) => {
      if (value < acc.min) acc.min = value
      if (value > acc.max) acc.max = value
      return acc
    },
    { min: Infinity, max: -Infinity },
  )

export const extractCoordinates = (svg: string) => {
  const absolute: number[] = []
  const relative: number[] = []

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
        parsePath(d, (command) => {
          if ('M'.indexOf(command.command) != -1) absolute.push(...command.coords)
          else if ('ml'.indexOf(command.command) != -1) relative.push(...command.coords)
        })
        break
    }
  }

  parser.write(svg).close()

  return { viewbox, absolute, relative }
}
