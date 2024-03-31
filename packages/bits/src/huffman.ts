//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import type { BitOutputStream } from './bitstream'

type HuffmanNode = {
  frequency: number
  symbol?: number
  left?: HuffmanNode
  right?: HuffmanNode
}

type HuffmanCode = {
  length: number
  value: number
}

export type HuffmanTree = HuffmanNode
export type HuffmanCodes = HuffmanCode[]
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
  (codes: HuffmanCodes, out: BitOutputStream) =>
  (symbol: number): void => {
    const code = codes[symbol]
    out.writeBits(code.value, code.length)
  }

const huffmanDecoder = (encodedData: string, codes: HuffmanCodes): number[] => {
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
