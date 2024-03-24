//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { Command } from './svg'

export const minmax = (commands: Command[]) =>
  commands.reduce(
    (acc, command) => {
      const value = command.dest
      if (value[0] < acc.minX) acc.minX = value[0]
      if (value[0] > acc.maxX) acc.maxX = value[0]
      if (value[1] < acc.minY) acc.minY = value[1]
      if (value[1] > acc.maxY) acc.maxY = value[1]
      return acc
    },
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )

export const scale = (commands: Command[], factorX: number, factorY: number) =>
  commands.map((command) => ({ ...command, dest: [command.dest[0] * factorX, command.dest[1] * factorY] }))
