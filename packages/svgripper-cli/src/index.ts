import { program } from 'commander'

import { convert } from './convert'

const createLog = (verbose: boolean) => (verbose ? console.log : () => {})

program
  .version('0.1.0')
  .name('svgr')
  .description('SVGRipper/CLI © 2024 Hardcore Engieering. All rights reserved.')
  .option('-v, --verbose', 'enable verbose mode')
  .command('convert')
  .alias('c')
  .description('Convert SVG file to SVGRipper format')
  .argument('<file>')
  .description('SVG file to convert')
  .option('-o, --output <file>', 'output file')
  .option('-b, --binary', 'output in binary format')
  .option('-w, --width <width>', 'preseve quailty for this width')
  .option('-h, --height <height>', 'preseve quailty for this width')
  .option('-d, --degree <quality>', 'consider vectors haing  `degree` differnce in degrees as same direction', '10')
  .action((file, options) => {
    convert(file, createLog(program.getOptionValue('verbose')), options).catch((error) => {
      if (error instanceof Error) console.error('Error:', error.message)
      else console.error('Error:', error)
    })
  })

program.parse(process.argv)
