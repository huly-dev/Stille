//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

export interface Stream {
  open(bits: number): void // this is optional call to verify if stream accepts values of given lengths in bits. Zero foe variable bit-length
  close(): void
}

export interface ByteStream extends Stream {
  byte(value: number): void
}
