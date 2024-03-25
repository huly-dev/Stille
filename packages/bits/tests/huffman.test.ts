import { buildHuffmanTree, type HuffmanNode } from '../src/huffman'

function printHuffmanTree(node: HuffmanNode, depth: number = 0, prefix: string = '') {
  if (node.symbol !== undefined) {
    console.log(' '.repeat(depth * 2) + prefix + 'Symbol: ' + node.symbol + ' (Frequency: ' + node.frequency + ')')
  } else {
    console.log(' '.repeat(depth * 2) + prefix + 'Node: ' + ' (Frequency: ' + node.frequency + ')')
    if (node.left) {
      printHuffmanTree(node.left, depth + 1, '0-')
    }
    if (node.right) {
      printHuffmanTree(node.right, depth + 1, '1-')
    }
  }
}

const freq = [
  47, 41, 50, 49, 44, 65, 49, 62, 62, 60, 80, 81, 72, 107, 90, 83, 99, 120, 127, 117, 131, 143, 148, 152, 168, 185, 213,
  193, 228, 240, 261, 295, 201, 166, 142, 162, 163, 187, 184, 183, 218, 187, 200, 202, 188, 212, 232, 256, 220, 213,
  252, 261, 237, 290, 268, 268, 303, 298, 380, 475, 609, 878, 959, 918, 1037, 928, 964, 847, 625, 442, 392, 323, 291,
  283, 262, 282, 227, 242, 239, 237, 237, 217, 239, 239, 186, 194, 208, 174, 192, 182, 176, 194, 170, 156, 132, 163,
  289, 260, 260, 246, 240, 233, 231, 181, 152, 167, 154, 130, 131, 121, 130, 111, 107, 86, 93, 101, 95, 68, 73, 70, 69,
  70, 62, 57, 44, 37, 42, 34,
]

// const freq = [1, 1, 2, 3, 5, 8, 13, 21]

const huffmanTree = buildHuffmanTree(freq)
printHuffmanTree(huffmanTree)
