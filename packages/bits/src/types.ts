//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export interface BinaryOutputStream {
  write(value: number): void
  close(): void
}

export interface BinaryInputStream {
  read(): number
  available(): boolean
  close(): void
}
