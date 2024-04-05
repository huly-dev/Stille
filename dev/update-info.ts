//
// © 2024 Hardcore Engineering, Inc.. All Rights Reserved.
// Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// · dev/update-info.ts
//

import packageJson from '../package.json'
import projectInfo from '../project-info.json'

const copyrightTs = `//
//   {{description}} | {{codename}}
//   Licensed under the {{full_license}} (SPDX: {{license}})
//
// • {{packageName}}/{{filename}}
// © {{year_start}} {{company}}. All Rights Reserved.
//
`

const copyrightIndex = `/**
 *   {{description}} | {{codename}}
 *   Licensed under the {{full_license}} (SPDX: {{license}})
 *
 * • {{packageOrg}}/{{packageName}}
 * © {{year_start}} {{company}}. All Rights Reserved.
 */
`

import { Glob, spawnSync } from 'bun'
import path from 'node:path'

const { description, version } = projectInfo['package.json']

function constructVersion(): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')

  const result = spawnSync(['git', 'rev-parse', '--short', 'HEAD'])
  const sha = result.stdout.toString().trim()

  const newVersion = `${version}+${date}-sha.${sha}`
  return newVersion
}

const newVersion = constructVersion()

function replacePlaceholders(template: string, placeholderValues: Record<string, string>): string {
  return template.replace(/{{\s*([\w_]+)\s*}}/g, (match, name) => {
    // If the placeholder key exists in the provided values, replace it; otherwise, do not replace it.
    return placeholderValues.hasOwnProperty(name) ? placeholderValues[name] : match
  })
}

function removeCommentLines(content: string): string {
  const lines = content.split('\n')

  let i = 0
  for (; i < lines.length; i++) {
    const trimmedLine = lines[i]
    if (!(trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith(' *'))) {
      break
    }
  }
  return lines.slice(i).join('\n')
}

async function processSource(packageFull: string, packageDir: string, filePath: string): Promise<void> {
  console.log(`processing source file at '${filePath}'...`)

  const fullPath = path.join(packageDir, filePath)

  const fileContent = await Bun.file(fullPath).text()
  const noCommentContent = removeCommentLines(fileContent)

  const filename = path.basename(filePath)
  const [packageOrg, packageName] = packageFull.split('/')

  const placeholderValues = {
    ...projectInfo['package.json'],
    ...projectInfo.other,
    version: newVersion,
    filename,
    packageOrg,
    packageName,
  }
  const template = filename.endsWith('index.ts') ? copyrightIndex : copyrightTs
  const newComment = replacePlaceholders(template, placeholderValues as any)
  const newContent = newComment + noCommentContent

  await Bun.write(fullPath, newContent)
}

async function processPackage(filePath: string): Promise<void> {
  const packageDir = path.dirname(filePath)
  const fileContent = await Bun.file(filePath).text()
  const packageData = JSON.parse(fileContent)

  const packageFull = packageData.name

  console.log(`\nprocessing '${packageFull}'...`)

  const newPackageData = {
    ...packageData,
    ...projectInfo['package.json'],
    version: newVersion,
  }
  const updatedPackageJson = JSON.stringify(newPackageData, null, 2)

  await Bun.write(filePath, updatedPackageJson)

  console.log(`updating copyrights in source files for '${packageFull}'...`)
  const glob = new Glob(`**/*.ts`)
  for await (const file of glob.scan(packageDir)) {
    await processSource(packageFull, packageDir, file)
  }

  if (packageFull === '@huly/platform') {
    console.log(`updating platform-info.json'...`)

    const info = projectInfo['package.json']
    const platformInfo = {
      name: packageFull,
      version: newVersion,
      description,
      license: info.license,
      author: info.author,
      homepage: info.homepage,
      contributors: info.contributors,
      year: projectInfo.other.year_start,
    }

    await Bun.write(path.join(packageDir, 'platform-info.json'), JSON.stringify(platformInfo, null, 2))
  }
}

async function main() {
  console.log(`updating '${description}' project info for version '${newVersion}'...`)

  const locations: string[] = packageJson.workspaces
  for (const location of locations) {
    console.log(`scanning '${location}'...`)
    const glob = new Glob(`${location}/package.json`)
    for await (const file of glob.scan('.')) {
      await processPackage(file)
    }
  }
}

main()
