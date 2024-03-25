//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { encoder } from '@huly/bits'
import { analyze, scaleSVG } from './analyze'
import type { SVG } from './svg'

export const encodeSVG = (svg: SVG, maxWidth: number, bitsOut: number, out: (value: number) => void) => {
  const e = encoder(bitsOut, out)

  console.log('Encoding SVG ...')

  if (svg.viewBox.xy[0] !== 0 || svg.viewBox.xy[1] !== 0) throw new Error('ViewBox must start at 0, 0')

  console.log(`SVG viewBox: ${svg.viewBox}`)

  const factor = maxWidth / svg.viewBox.wh[0]
  const maxHeight = svg.viewBox.wh[1] * factor

  console.log(`Scaling SVG by ${factor} to ${maxWidth}x${maxHeight}`)

  const scaledSVG = scaleSVG(svg, factor)

  const svb = scaledSVG.viewBox

  console.log(`Scaled SVG viewBox: ${svb.wh[0]}x${svb.wh[1]}`)

  scaledSVG.elements.forEach((element) => {
    switch (element.name) {
      case 'path':
        const { segments } = element
        segments.forEach((segment) => {
          const lineTo = segment.lineTo
          const { bitsX, bitsY, shiftX, shiftY } = analyze(lineTo)
          lineTo.forEach((point) => {
            const x = Math.round(point[0] + shiftX)
            const y = Math.round(point[1] + shiftY)
            if (x !== 0 || y !== 0) {
              e.writeBits(x, bitsX)
              e.writeBits(y, bitsY)
            }
          })
        })
        break
    }
  })

  e.flushBits()
}
