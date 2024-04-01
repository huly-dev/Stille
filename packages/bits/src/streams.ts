//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { InStream, OutStream } from './types'

interface Collector<T> extends OutStream {
  result(): T
}

export function stringCollector(): Collector<string> {
  let buffer = ''
  return {
    write: (value: number) => (buffer += String.fromCharCode(value)),
    close: () => {},
    result: () => buffer,
  }
}

export function bytesCollector(): Collector<number[]> {
  const buffer: number[] = []
  return {
    write: (value: number) => buffer.push(value),
    close: () => {},
    result: () => buffer,
  }
}

export function byteArrayInStream(array: number[]): InStream {
  let index = 0
  return {
    available: () => index < array.length,
    read: () => array[index++],
    close: () => {},
  }
}
