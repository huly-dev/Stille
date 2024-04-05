//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • bits/types.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

export interface OutStream {
  close(): void
}

export interface InStream {
  available(): boolean
  close(): void
}

export interface ByteOutStream extends OutStream {
  writeByte(value: number): void
}

export interface ByteInStream extends InStream {
  readByte(): number
}
