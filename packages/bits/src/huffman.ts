//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

type HuffmanNode = {
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
type FrequencyTable = [symbol: number, frequency: number][]

// Hardcoded example frequency table for a 4-bit alphabet (0-15)
const frequencies: FrequencyTable = [
  [0, 23],
  [1, 12],
  [2, 8],
  [3, 4],
  [4, 2],
  [5, 1],
  [6, 1],
  [7, 1],
  [8, 1],
  [9, 98],
  [10, 1],
  [11, 55],
  [12, 1],
  [13, 11],
  [14, 91],
  [15, 1],
]

const buildHuffmanTree = (frequencies: FrequencyTable): HuffmanTree => {
  const queue: HuffmanNode[] = frequencies
    .sort((a, b) => b[1] - a[1])
    .map(([symbol, frequency]) => ({ symbol, frequency }))

  while (queue.length > 1) {
    let left = queue.pop()!
    let right = queue.pop()!

    let mergedNode: HuffmanNode = {
      frequency: left.frequency + right.frequency,
      left: left,
      right: right,
    }

    // Insert the merged node back into the queue, maintaining sorted order by frequency
    let i = queue.findIndex((node) => node.frequency > mergedNode.frequency)
    if (i === -1) {
      queue.push(mergedNode)
    } else {
      queue.splice(i, 0, mergedNode)
    }
  }

  return queue[0]
}

const generateCanonicalHuffmanCodes = (huffmanTree: HuffmanTree): CanonicalHuffmanCodes => {
  const traverse = (node: HuffmanNode, depth: number, value: number, codes: CanonicalHuffmanCodes) => {
    if (node.symbol !== undefined) {
      codes[node.symbol] = { length: depth, value: value }
    } else {
      if (node.left) traverse(node.left, depth + 1, value << 1, codes)
      if (node.right) traverse(node.right, depth + 1, (value << 1) | 1, codes)
    }
  }

  let codes: CanonicalHuffmanCodes = {}
  traverse(huffmanTree, 0, 0, codes)
  return codes
}

const encode = (data: number[], codes: CanonicalHuffmanCodes): string => {
  return data
    .map((symbol) => {
      let code = codes[symbol]
      return code.value.toString(2).padStart(code.length, '0')
    })
    .join('')
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

const huffmanTree = buildHuffmanTree(frequencies)
const codes = generateCanonicalHuffmanCodes(huffmanTree)

const dataToEncode = [0, 3, 4, 5, 0, 1, 2] // Example data using the 4-bit alphabet
const encodedData = encode(dataToEncode, codes)
console.log(encodedData)

const decodedData = decode(encodedData, codes)
console.log(decodedData)
