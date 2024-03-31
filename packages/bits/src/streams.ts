//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export function stringCollector() {
  let buffer = ''
  return {
    open(bits: number) {
      if (bits !== 8) throw new Error('stringCollector: expecting 8 bits input')
    },
    byte: (value: number) => (buffer += String.fromCharCode(value)),
    close() {},
    result: () => buffer,
  }
}

export function bytesCollector() {
  const buffer: number[] = []
  return {
    open(bits: number) {
      if (bits !== 8) throw new Error('stringCollector: expecting 8 bits input')
    },
    byte: (value: number) => buffer.push(value),
    close() {},
    result: () => buffer,
  }
}
