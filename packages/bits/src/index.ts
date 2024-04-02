/**
 *   Huly® Platform™ — Tools • @huly/bitstream
 *   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
 *
 * © 2024 Hardcore Engineering Inc. All Rights Reserved.
 */

// export { base91OutputStream, isStringOutputStream, stringOutputStream, type StringOutputStream } from './basex'
export { bitOutputStream, numberOfBits, singleBitInStream } from './bitstream'
export { fileOutputStream } from './filestream'
export {
  buildHuffmanTree,
  countFrequencies,
  generateHuffmanCodes,
  huffmanDecode,
  huffmanEncoder,
  type HuffmanCodes,
} from './huffman'
export { byteArrayInStream, bytesCollector } from './streams'
export type { BitInStream, BitOutStream, InStream, OutStream } from './types'
