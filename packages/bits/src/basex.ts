//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { BinaryOutputStream } from './types'

function baseXOutputStream(
  base: number,
  bytesBuffer: number,
  baseBuffer: number,
  out: StringOutputStream,
): StringOutputStream {
  const Base = BigInt(base)
  const Byte = BigInt(256)

  if (Byte ** BigInt(bytesBuffer) > Base ** BigInt(baseBuffer))
    throw new Error('encodeBaseX: `baseBuffer` too small for `bytesBuffer`')

  const send = (char: BigInt) => out.write(Number(char))

  let buffer = 1n
  let bytes = 0

  return {
    write(value: number) {
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
    close() {
      while (bytes !== 0 && buffer !== 0n) {
        send(buffer % Base)
        buffer /= Base
      }
      out.close()
    },
    result: out.result,
  }
}

const special = '\'"`'
const firstChar = 0x21
const lastChar = 0x7e
const base91 = lastChar - firstChar + 1 - special.length

export const base91OutputStream = (out: StringOutputStream) =>
  baseXOutputStream(base91, 13, 16, {
    write(x: number) {
      const char = x + firstChar
      const i = special.indexOf(String.fromCharCode(char))
      out.write(i >= 0 ? lastChar - i : char)
    },
    close: out.close,
    result: out.result,
  })

export interface StringOutputStream extends BinaryOutputStream {
  result(): string
}

export function stringOutputStream(): StringOutputStream {
  let buffer = ''
  return {
    write(value: number) {
      buffer += String.fromCharCode(value)
    },
    close() {},
    result: () => buffer,
  }
}

export function isStringOutputStream(value: BinaryOutputStream): value is StringOutputStream {
  return typeof value === 'object' && 'result' in value
}
