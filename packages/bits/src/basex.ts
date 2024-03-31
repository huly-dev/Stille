//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export type ByteWriteStream = {
  writeByte(value: number): void
  flush(): void
}

export function encodeBaseX(
  base: number,
  bytesBuffer: number,
  baseBuffer: number,
  out: (base: number) => void,
): ByteWriteStream {
  const Base = BigInt(base)
  const Byte = BigInt(256)

  if (Byte ** BigInt(bytesBuffer) > Base ** BigInt(baseBuffer))
    throw new Error('encodeBaseX: `baseBuffer` too small for `bytesBuffer`')

  const send = (char: BigInt) => out(Number(char))

  let buffer = 1n
  let bytes = 0

  return {
    writeByte(value: number) {
      buffer *= Byte
      buffer += BigInt(value)
      if (++bytes === bytesBuffer) {
        for (let i = 0; i < baseBuffer; i++) {
          send(buffer % Base)
          buffer /= Base
        }
        buffer = 1n
        bytes = 0
      }
    },

    flush() {
      while (bytes !== 0 && buffer !== 0n) {
        send(buffer % Base)
        buffer /= Base
      }
    },
  }
}
