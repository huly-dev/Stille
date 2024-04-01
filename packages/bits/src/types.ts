//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export interface OutStream {
  write(value: number): void
  close(): void
}

export interface BitOutStream extends OutStream {
  writeBits(value: number, length: number): void
}

export interface InStream {
  available(): boolean
  read(): number
  close(): void
}

export interface BitInStream extends InStream {
  readBits(length: number): number
}
