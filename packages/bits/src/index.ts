/**
 *   Huly® Platform™ — Tools • @huly/bitstream
 *   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
 *
 * © 2024 Hardcore Engineering Inc. All Rights Reserved.
 */

export { encodeBaseX, type ByteWriteStream } from './basex'
export {
  buildHuffmanTree,
  countFrequencies,
  createHuffmanEncoder,
  generateHuffmanCodes,
  type HuffmanCodes,
} from './huffman'
export { createBitWriteStream, numberOfBits, type BitWriteStream } from './stream'
