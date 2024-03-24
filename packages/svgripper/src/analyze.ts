//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { numberOfBits } from './encode'
import type { Command, SVG } from './svg'

export const min = (commands: Command[]) =>
  commands.reduce(
    (acc, command) => {
      const value = command.dest
      if (value[0] < acc.minX) acc.minX = value[0]
      if (value[1] < acc.minY) acc.minY = value[1]
      return acc
    },
    { minX: Infinity, minY: Infinity },
  )

export const max = (commands: Command[]) =>
  commands.reduce(
    (acc, command) => {
      const value = command.dest
      if (value[0] > acc.maxX) acc.maxX = value[0]
      if (value[1] > acc.maxY) acc.maxY = value[1]
      return acc
    },
    { maxX: -Infinity, maxY: -Infinity },
  )

export const scale = (commands: Command[], factorX: number, factorY: number): Command[] =>
  commands.map((command) => ({ ...command, dest: [command.dest[0] * factorX, command.dest[1] * factorY] }))

export const add = (commands: Command[], x: number, y: number): Command[] =>
  commands.map((command) => ({ ...command, dest: [command.dest[0] + x, command.dest[1] + y] }))

export const analyzeSVG = (svg: SVG) => {
  let totalBits = 0
  let segmentsTotal = 0
  let commandsTotal = 0

  svg.elements.forEach((element) => {
    switch (element.name) {
      case 'path':
        const { segments } = element
        segments.forEach((segment) => {
          segmentsTotal++
          commandsTotal += segment.commands.length
          const { commands } = segment
          const { minX, minY } = min(commands)
          const normalized = add(commands, -minX, -minY)
          const { maxX, maxY } = max(normalized)
          const bitsX = numberOfBits(maxX)
          const bitsY = numberOfBits(maxY)
          const segmentTotal = (bitsX + bitsY) * commands.length
          totalBits += segmentTotal
          console.log({ len: commands.length, segmentTotal, bitsX, bitsY, maxX, maxY })
        })
        break
    }
  })

  console.log({ segmentsTotal, commandsTotal, totalBits, totalBytes: totalBits / 8, totalAscii: totalBits / 7 })
}
