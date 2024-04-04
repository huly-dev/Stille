//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { ByteInStream, ByteOutStream } from './types'

const BufferSize = 0x1000

export function fileOutStream(path: string): ByteOutStream {
  const buffer = new ArrayBuffer(BufferSize)
  const byteArray = new Uint8Array(buffer)
  let pos = 0

  const file = Bun.file(path)
  const writer = file.writer()

  return {
    writeByte: (value: number) => {
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

export async function fileInStream(path: string): Promise<ByteInStream> {
  const file = Bun.file(path)
  const buffer = await file.arrayBuffer()
  const byteArray = new Uint8Array(buffer)
  let pos = 0

  return {
    available: () => pos < byteArray.length,
    readByte: () => byteArray[pos++],
    close: () => {},
  }
}
