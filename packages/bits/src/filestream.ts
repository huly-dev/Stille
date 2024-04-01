//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { OutStream } from './types'

const BufferSize = 0x1000

export function fileOutputStream(path: string): OutStream {
  const buffer = new ArrayBuffer(BufferSize)
  const byteArray = new Uint8Array(buffer)
  let pos = 0

  const file = Bun.file(path)
  const writer = file.writer()

  return {
    write: (value: number) => {
      byteArray[pos++] = value
      if (pos === BufferSize) {
        writer.write(byteArray)
        pos = 0
      }
    },
    close: () => {
      writer.write(byteArray.slice(0, pos))
      writer.end()
    },
  }
}
