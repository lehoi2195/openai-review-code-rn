import { exec } from 'child_process'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { exit } from 'process'
import { gitAzdevEnvVariables } from '~/config'
import { LOG } from './helpers'
import { ReviewFile } from './types'

/**
 * Execute a shell command and return the result as a Promise.
 * Handles standard output and error handling.
 */
const executeCommand = async (command: string, options: { cwd?: string } = {}): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Command failed: ${command}\nError: ${error.message}`))
      } else if (stderr) {
        reject(new Error(`Command error: ${stderr}`))
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

/**
 * Get the root directory of the current Git repository.
 */
const getGitRoot = async (): Promise<string> => {
  return executeCommand('git rev-parse --show-toplevel')
}

/**
 * Generate the command string to fetch changed file names.
 */
const getChangedFilesNamesCommand = (): string => {
  const { azdevSha, baseSha } = gitAzdevEnvVariables()
  return `git diff --name-only --diff-filter=AMRT ${baseSha} ${azdevSha}`
}

/**
 * Fetch the list of changed file names from the current Git diff.
 */
const getChangedFilesNames = async (): Promise<string[]> => {
  const gitRoot = await getGitRoot()
  const commandString = getChangedFilesNamesCommand()
  const result = await executeCommand(commandString, { cwd: gitRoot })

  return result
    .split('\n')
    .filter((fileName) => fileName.trim() !== '')
    .map((fileName) => join(gitRoot, fileName.trim()))
}

/**
 * Generate the command string to fetch changed lines in a specific file.
 */
const getChangesFileLinesCommand = (fileName: string): string => {
  const { azdevSha, baseSha } = gitAzdevEnvVariables()
  return `git diff -U0 --diff-filter=AMRT ${baseSha} ${azdevSha} ${fileName}`
}

/**
 * Fetch the changed lines of a specific file.
 */
const getChangedFileLines = async (fileName: string): Promise<string> => {
  const commandString = getChangesFileLinesCommand(fileName)
  const result = await executeCommand(commandString)

  return result
    .split('\n')
    .filter((line) => (line.startsWith('+') || line.startsWith('-')) && !line.startsWith('---') && !line.startsWith('+++'))
    .join('\n')
}

/**
 * Fetch a list of files with their content and changed lines.
 */
export const getListFilesChanges = async (): Promise<ReviewFile[]> => {
  try {
    const fileNames = await getChangedFilesNames()

    if (fileNames.length === 0) {
      LOG.warn('No files with changes found')
      exit(0) // Exit the process if no files are found
    }

    // Fetch content and changed lines for each file
    const files = await Promise.all(
      fileNames.map(async (fileName) => {
        const fileContent = await readFile(fileName, 'utf8')
        const changedLines = await getChangedFileLines(fileName)
        return { fileName, fileContent, changedLines }
      }),
    )

    return files
  } catch (error) {
    throw new Error(`Failed to get files with changes: ${JSON.stringify(error)}`)
  }
}
