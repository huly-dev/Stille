/**
 *   Huly® Platform™ — Tools • @huly/bitstream
 *   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
 *
 * © 2024 Hardcore Engineering Inc. All Rights Reserved.
 */

export { base91OutStream } from './basex'
export { bitOutStream, numberOfBits, singleBitInStream, type BitOutStream } from './bitstream'
export { fileOutStream } from './filestream'
export { countFrequencies, generateHuffmanCodes, huffmanDecode, huffmanEncoder, type HuffmanCodes } from './huffman'
export { byteArrayInStream, bytesCollector, stringCollector } from './streams'
export type { ByteInStream, ByteOutStream, InStream, OutStream } from './types'
