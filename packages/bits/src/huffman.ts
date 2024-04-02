//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { BitInStream, BitOutStream, OutStream } from './types'

type HuffmanNode = {
  frequency: number
  symbol?: number
  left?: HuffmanNode
  right?: HuffmanNode
}

export type HuffmanCode = {
  length: number
  value: number
}

export type HuffmanTree = HuffmanNode
export type HuffmanCodes = HuffmanCode[]
type FrequencyTable = number[]

const constructNodes = (frequencies: FrequencyTable) => {
  const result = frequencies.map((frequency, symbol) => ({ symbol, frequency }))
  result.push({ frequency: 1, symbol: -1 }) // EOF symbol
  return result
}

export const buildHuffmanTree = (frequencies: FrequencyTable): HuffmanTree => {
  const queue: HuffmanNode[] = constructNodes(frequencies).sort((a, b) => b.frequency - a.frequency)

  while (queue.length > 1) {
    const left = queue.pop()!
    const right = queue.pop()!
    const mergedNode: HuffmanNode = { frequency: left.frequency + right.frequency, left, right }

    const i = queue.findIndex((node) => node.frequency < mergedNode.frequency)
    if (i === -1) queue.push(mergedNode)
    else queue.splice(i, 0, mergedNode)
  }

  return queue[0]
}

export const generateHuffmanCodes = (huffmanTree: HuffmanTree): HuffmanCodes => {
  const traverse = (node: HuffmanNode, depth: number, value: number, codes: HuffmanCodes) => {
    if (node.symbol !== undefined) codes[node.symbol] = { length: depth, value: value }
    else {
      if (node.left) traverse(node.left, depth + 1, value << 1, codes)
      if (node.right) traverse(node.right, depth + 1, (value << 1) | 1, codes)
    }
  }

  const codes: HuffmanCodes = []
  traverse(huffmanTree, 0, 0, codes)
  return codes
}

export const huffmanEncoder =
  (codes: HuffmanCodes, out: BitOutStream) =>
  (symbol: number): void => {
    const code = codes[symbol]
    out.writeBits(code.value, code.length)
    if (symbol === -1) out.close()
  }

export const huffmanDecode = (codes: HuffmanCodes, input: BitInStream, out: OutStream) => {
  const invert = codes.map(({ value }, i) => [value, i] as [number, number])
  const invertedCodes = new Map(invert)
  let buffer = 0
  let length = 0

  while (input.available()) {
    buffer |= input.readBits(1) << length
    const symbol = invertedCodes.get(buffer)
    if (!symbol) continue
    console.log('read symbol:', symbol, 'code', buffer)
    if (symbol === -1) break
    out.write(symbol)
    buffer = 0
    length = 0
  }
}

export const countFrequencies = (data: number[], symbols: number): number[] =>
  data.reduce((freq, symbol) => {
    freq[symbol]++
    return freq
  }, new Array(symbols).fill(0))
