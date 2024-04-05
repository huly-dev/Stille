//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • bits/streams.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import type { ByteInStream, ByteOutStream } from './types'

interface Collector<T> extends ByteOutStream {
  result(): T
}

export function stringCollector(): Collector<string> {
  let buffer = ''
  return {
    writeByte: (value: number) => (buffer += String.fromCharCode(value)),
    close: () => {},
    result: () => buffer,
  }
}

export function bytesCollector(): Collector<number[]> {
  const buffer: number[] = []
  return {
    writeByte: (value: number) => buffer.push(value),
    close: () => {},
    result: () => buffer,
  }
}

export function byteArrayInStream(array: number[]): ByteInStream {
  let index = 0
  return {
    available: () => index < array.length,
    readByte: () => array[index++],
    close: () => {},
  }
}
