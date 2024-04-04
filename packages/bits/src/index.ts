/**
 *   Huly® Platform™ — Tools • @huly/bitstream
 *   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
 *
 * © 2024 Hardcore Engineering Inc. All Rights Reserved.
 */

export { base91OutStream } from './basex'
export { bitInStream, bitOutStream, numberOfBits, type BitInStream, type BitOutStream } from './bitstream'
export { fileInStream, fileOutStream } from './filestream'
export {
  countFrequencies,
  generateHuffmanCodes,
  huffmanInStream,
  type HuffmanCodes,
  type SymbolInStream,
  type SymbolOutStream,
} from './huffman'
export { byteArrayInStream, bytesCollector, stringCollector } from './streams'
export type { ByteInStream, ByteOutStream, InStream, OutStream } from './types'
