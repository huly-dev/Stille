//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { BitWriteStream } from './stream'

export type HuffmanNode = {
  symbol?: number
  frequency: number
  left?: HuffmanNode
  right?: HuffmanNode
  // No need for a code property since we'll be dealing with canonical Huffman codes
}

type HuffmanCode = {
  length: number
  value: number
}

type HuffmanTree = HuffmanNode
type CanonicalHuffmanCodes = HuffmanCode[]
type FrequencyTable = number[]

const constructNodes = (frequencies: FrequencyTable) => frequencies.map((frequency, symbol) => ({ symbol, frequency }))

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

export const generateHuffmanCodes = (huffmanTree: HuffmanTree): CanonicalHuffmanCodes => {
  const traverse = (node: HuffmanNode, depth: number, value: number, codes: CanonicalHuffmanCodes) => {
    if (node.symbol !== undefined) {
      codes[node.symbol] = { length: depth, value: value }
    } else {
      if (node.left) traverse(node.left, depth + 1, value << 1, codes)
      if (node.right) traverse(node.right, depth + 1, (value << 1) | 1, codes)
    }
  }

  const codes: CanonicalHuffmanCodes = []
  traverse(huffmanTree, 0, 0, [])
  return codes
}

export const encode =
  (codes: CanonicalHuffmanCodes, out: BitWriteStream) =>
  (symbol: number): void => {
    const code = codes[symbol]
    out.writeBits(code.value, code.length)
  }

const decode = (encodedData: string, codes: CanonicalHuffmanCodes): number[] => {
  const invertedCodes: Record<string, number> = {}
  Object.entries(codes).forEach(([symbol, code]) => {
    const bitString = code.value.toString(2).padStart(code.length, '0')
    invertedCodes[bitString] = parseInt(symbol)
  })

  let output: number[] = []
  let buffer: string[] = []

  for (let bit of encodedData) {
    buffer.push(bit)
    const bitString = buffer.join('')
    if (invertedCodes[bitString] !== undefined) {
      output.push(invertedCodes[bitString])
      buffer = []
    }
  }

  return output
}

export const countFrequencies = (data: number[], symbols: number): number[] =>
  data.reduce((freq, symbol) => {
    freq[symbol]++
    return freq
  }, new Array(symbols).fill(0))
