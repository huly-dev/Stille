/**
 *   Huly® Platform™ — Development Tools and Libraries | Stille
 *   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
 *
 * • @huly/bits
 * © 2024 Hardcore Engineering. All Rights Reserved.
 */

export { base91OutStream } from './basex'
export { bitInStream, bitOutStream, numberOfBits, type BitInStream, type BitOutStream } from './bitstream'
export { fileInStream, fileOutStream } from './filestream'
export {
  frequencyTable,
  generateHuffmanCodes,
  huffmanInStream,
  huffmanOutStream,
  type FrequencyTable,
  type HuffmanCodes,
  type SymbolInStream,
  type SymbolOutStream,
} from './huffman'
export { byteArrayInStream, bytesCollector, stringCollector } from './streams'
export type { ByteInStream, ByteOutStream, InStream, OutStream } from './types'
