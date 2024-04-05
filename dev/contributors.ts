//
// © 2024 Hardcore Engineering, Inc.. All Rights Reserved.
// Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// · dev/contributors.ts
//

import { spawnSync } from 'bun'

interface Contributor {
  name: string
  email: string
  firstCommitDate: string // ISO date string
  lastCommitDate: string // ISO date string
}

function getContributors(): Contributor[] {
  const gitLogCommand = ['git', 'log', '--format=%aN|%aE|%aI']
  const gitLogResult = spawnSync(gitLogCommand)

  const output = gitLogResult.stdout
  const lines = output.toString().split('\n')

  const contributorsMap: Record<string, Contributor> = {}

  for (const line of lines) {
    const [name, email, isoDate] = line.split('|')
    if (!email) continue
    if (contributorsMap[email]) {
      // Update the first and last dates by comparing
      const firstDate = new Date(contributorsMap[email].firstCommitDate)
      const lastDate = new Date(contributorsMap[email].lastCommitDate)
      const commitDate = new Date(isoDate)

      if (commitDate < firstDate) {
        contributorsMap[email].firstCommitDate = isoDate
      }
      if (commitDate > lastDate) {
        contributorsMap[email].lastCommitDate = isoDate
      }
    } else {
      // Initialize the contributor entry
      contributorsMap[email] = {
        name,
        email,
        firstCommitDate: isoDate,
        lastCommitDate: isoDate,
      }
    }
  }

  const contributors = Object.values(contributorsMap)
  return contributors
}

// Example usage:
try {
  const contributors = getContributors()
  console.log(contributors)
} catch (error) {
  console.error('An error occurred while getting contributors:', error)
}
