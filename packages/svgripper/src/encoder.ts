//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { SAXParser } from 'sax'

export function encoder(maxBits: number, out: (value: number) => void) {
  let word: number = 0
  let bit: number = 0

  return {
    writeUInt(value: number, bits: number) {
      if (value < 0) throw new Error('Value must be non-negative')
      if (bits < 0 || bits > maxBits) throw new Error('Invalid number of bits')

      for (let fit = maxBits - bit; bits > fit; fit = maxBits - bit) {
        const toFit = value & ((1 << fit) - 1)
        word |= toFit << bit
        value >>>= fit
        bit += fit
        bits -= fit
        out(word)
        bit = word = 0
      }
      word |= value << bit
      bit += bits
    },
    flush() {
      if (bit > 0) {
        out(word)
        bit = word = 0
      }
    },
  }
}

const TagBits = 1

const Path = 0x0
const Circle = 0x1

const ClassBits = 3

const NoClass = 0x00
const countryID = ['UY', 'GE', 'RU', 'FR', 'US', 'MX', 'KZ']
const countryName = ['Uruguay', 'Georgia', 'Russian Federation', 'France', 'United States', 'Mexico', 'Kazakhstan']

// export const encodeSVG = (svg: string) => {
//   let numbers = 0

//   const e = encoder(7, (_) => {
//     numbers++
//   })

//   const encodeAttributes = (attributes: Record<string, string>) => {
//     let clazz = NoClass

//     for (const [key, value] of Object.entries(attributes)) {
//       switch (key) {
//         case 'id':
//           clazz = countryID.findIndex((v) => v === value) + 1
//           break
//         case 'd':
//           parsePath(value, (command) => {
//             console.log(command)
//             e.writeUInt(command.command, CommandBits)
//           })
//           break
//         case 'class':
//           clazz = countryName.findIndex((v) => v === value) + 1
//           break
//         case 'name':
//           clazz = countryName.findIndex((v) => v === value) + 1
//           break
//         default:
//           console.log('Unhandled', key, value)
//       }
//     }

//     if (clazz !== NoClass) {
//       console.log('Classified', clazz)
//     }
//     e.writeUInt(clazz, ClassBits)
//   }

//   const parser = new SAXParser(true)
//   parser.onopentag = (node) => {
//     switch (node.name) {
//       case 'svg':
//         console.log('svg', node.attributes)
//         break
//       case 'path':
//         e.writeUInt(Path, TagBits)
//         encodeAttributes(node.attributes as Record<string, string>)
//         break
//       case 'circle':
//         e.writeUInt(Circle, TagBits)
//         break
//       default:
//         console.log('tag', node.name)
//     }
//   }
//   parser.write(svg).close()

//   console.log('encoded', numbers)

//   return {}
// }
