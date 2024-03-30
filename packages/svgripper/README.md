# SVGRipper

## SVRG Binary Format

SVGR binary format is a compact representation of SVG paths. It is designed to be used to limit resources usage (for example in embedded systems) or in regular websites / web applications for convenient SVG managmenet, such as icons and sprite libraries. The format uses variable bit-lenght and Huffman encoding of the path segments.

### Constants

| Constant              | Default Value | Description                             |
| --------------------- | ------------- | --------------------------------------- |
| **MAX_ABSOLUTE_BITS** | 13            | Maximum bits for absolute coordinates   |
| **FREQUENCY_BITS**    | 5             | Number of bits for frequency table item |

### Header

- `[x: MAX_ABSOLUTE_BITS`, `[y: MAX_ABSOLUTE_BITS]` -- ViewBox
- `[bits: FREQUENCY_BITS]` -- Number of bits in the frequency table item, 0 means no huffman encoding used
- `[symbols: MAX_ABSOLUTE_BITS]` -- Number of symbols in the Huffman table
- `[frequency: bits]...` -- frequency for each symbol in the table

### Path Segments

- `0 | 1 : 1bit` -- 0 means MoveTo relative to previous segment's initial point, 1 means MoveTo absolute coordinates
  - If relative, then should fit Huffman encoding, otherwise absolute coordinates
  - `[x: MAX_ABSOLUTE_BITS]`, `[y: MAX_ABSOLUTE_BITS]` -- MoveTo command `[x, y]`, absolute coordinates

For each LineTo command:

- `[dx: HuffmanCode, dy: HuffmanCode]...` -- Huffman encoding for path segments

End of path:

- `[0: HuffmanCode, 0: HuffmanCode]` -- ClosePath command
