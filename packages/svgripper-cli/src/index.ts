/**
 *   Huly® Platform™ — Development Tools and Libraries | Stille
 *   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0)
 *
 * • @huly/svgripper-cli
 * © 2024 Hardcore Engineering. All Rights Reserved.
 */

import { program } from 'commander'

import { decode } from './decode'
import { encode } from './encode'

const createLog = (verbose: boolean) => (verbose ? console.log : () => {})

const errorHandler = (error: unknown) => {
  if (error instanceof Error) console.error('Error:', error.message)
  else console.error('Error:', error)
}

program
  .version('0.1.0')
  .name('svgr')
  .description('SVGRipper/CLI © 2024 Hardcore Engineering. All rights reserved. https://hardcoreeng.com')
  .option('-v, --verbose', 'enable verbose mode')

program
  .command('encode')
  .alias('e')
  .description('Encode SVG file in SVGRipper format')
  .argument('<file>', 'SVG file to convert')
  .option('-o, --output <file>', 'output file')
  .option('-b, --binary', 'output in binary format')
  .option('-w, --width <width>', 'preseve quailty for this width')
  .option('-h, --height <height>', 'preseve quailty for this width')
  .option('-d, --degree <quality>', 'consider vectors haing  `degree` differnce in degrees as same direction', '10')
  .action((file, options) => encode(file, createLog(program.getOptionValue('verbose')), options).catch(errorHandler))

program
  .command('decode')
  .alias('d')
  .description('Decode SVGRipper format to SVG file')
  .argument('<file>', 'SVGR file to convert')
  .option('-o, --output <file>', 'output file')
  .action((file, options) => decode(file, createLog(program.getOptionValue('verbose')), options).catch(errorHandler))

program.parse(process.argv)
