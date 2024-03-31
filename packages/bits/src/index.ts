/**
 *   Huly® Platform™ — Tools • @huly/bitstream
 *   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
 *
 * © 2024 Hardcore Engineering Inc. All Rights Reserved.
 */

export { base91OutputStream, isStringOutputStream, stringOutputStream, type StringOutputStream } from './basex'
export { bitInputStream, bitOutputStream, bitToByteOutputStream, numberOfBits, type BitOutputStream } from './bitstream'
export { fileOutputStream } from './filestream'
export { buildHuffmanTree, countFrequencies, generateHuffmanCodes, huffmanEncoder, type HuffmanCodes } from './huffman'
export type { BinaryOutputStream } from './types'
