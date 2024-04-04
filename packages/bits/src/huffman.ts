//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
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

type FrequencyTable = number[]

const constructNodes = (frequencies: FrequencyTable) => {
  const result = frequencies.map((frequency, symbol) => ({ symbol, frequency }))
  result.push({ frequency: 1, symbol: -1 }) // EOF symbol
  return result
}

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
    const code = codes[symbol]
    out.writeBits(code.value, code.length)
  },
  writeBits: out.writeBits,
  writeByte: out.writeByte,
  close: () => {
    const code = codes[-1]
    out.writeBits(code.value, code.length)
    out.close()
  },
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
    readBits: input.readBits,
    readByte: input.readByte,
    available: input.available,
    close: input.close,
  }
}

// export const huffmanDecode = (codes: HuffmanCodes, input: BitInStream, out: SymbolOutStream) => {
//   const invert = codes.map(({ value, length }, i) => [(1 << length) | value, i] as [number, number])
//   const invertedCodes = new Map(invert)
//   let buffer = 1

//   while (input.available()) {
//     buffer = (buffer << 1) | input.readBits(1)
//     const symbol = invertedCodes.get(buffer)
//     if (symbol !== undefined) {
//       if (symbol === -1) break
//       out.writeSymbol(symbol)
//       buffer = 1
//     }
//   }
// }

export const countFrequencies = (data: number[], symbols: number): number[] =>
  data.reduce((freq, symbol) => {
    freq[symbol]++
    return freq
  }, new Array(symbols).fill(0))
