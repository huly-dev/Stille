//
//   Huly® Platform™ Tools
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { fileInStream } from "@huly/bits"

type Options = {
  binary?: boolean
  input?: string
}

export async function decode(file: string, log: (message: string) => void, options: Options) {
  log('decoding svgr format...')
  const svgr = await fileInStream(file)
  svgr.
}
