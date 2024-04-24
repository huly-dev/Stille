//
//   Huly® Platform™ — Development Tools and Libraries | Stille
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
//
// • bits/huffman.ts
// © 2024 Hardcore Engineering. All Rights Reserved.
//

import { type BitInStream, type BitOutStream } from './bitstream'

export interface SymbolOutStream extends BitOutStream {
  writeSymbol(symbol: number): void
}

export interface SymbolInStream extends BitInStream {
  readSymbol(): number
}

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

type HuffmanTree = HuffmanNode
export type HuffmanCodes = HuffmanCode[]

export type FrequencyTable = {
  frequencies: number[]
  indexOffset: number
}

export const frequencyTable = (data: number[]): FrequencyTable => {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const symbols = max - min + 1
  return {
    frequencies: data.reduce((freq, symbol) => {
      freq[symbol - min]++
      return freq
    }, new Array(symbols).fill(0)),
    indexOffset: min,
  }
}

const constructNodes = (table: FrequencyTable) =>
  table.frequencies.map((frequency, i) => ({ symbol: i + table.indexOffset, frequency }))

const buildHuffmanTree = (frequencies: FrequencyTable): HuffmanTree => {
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

export const generateHuffmanCodes = (frequencies: FrequencyTable): HuffmanCodes => {
  const huffmanTree = buildHuffmanTree(frequencies)

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

export const huffmanOutStream = (codes: HuffmanCodes, out: BitOutStream): SymbolOutStream => ({
  writeSymbol: (symbol: number) => {
    if (!Number.isInteger(symbol)) throw new Error('symbol must be an integer')
    const code = codes[symbol]
    out.writeBits(code.value, code.length)
  },
  writeBits: out.writeBits,
  writeByte: out.writeByte,
  close: out.close,
})

export const huffmanInStream = (codes: HuffmanCodes, input: BitInStream): SymbolInStream => {
  const invert = codes.map(({ value, length }, i) => [(1 << length) | value, i] as [number, number])
  const invertedCodes = new Map(invert)

  let buffer = 1

  return {
    readSymbol: () => {
      while (true) {
        buffer = (buffer << 1) | input.readBits(1)
        const symbol = invertedCodes.get(buffer)
        if (symbol !== undefined) {
          buffer = 1
          return symbol
        }
      }
    },
    available: input.available,
    readBits: input.readBits,
    readByte: input.readByte,
    close: input.close,
  }
}
