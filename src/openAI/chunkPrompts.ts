import { formatPrompt } from '~/utils/constants'
import { LOG } from '~/utils/helpers'
import { PromptFile, ReviewFile } from '~/utils/types'
import { generatePrompt } from './generatePrompt'

// export const chunkFilesToPrompts = (files: ReviewFile[], maxPromptLength: number): string[] => {
//   const maxPayloadLength = maxPromptLength - PROMPT_CONTENT.length

//   const prompts: string[] = []
//   let currentBatch: PromptFile[] = []
//   let currentBatchSize = 0

//   const promptFiles = generatePrompt(files, maxPayloadLength)

//   for (const file of promptFiles) {
//     const currentFileSize = file.fileName.length + file.promptContent.length

//     if (currentFileSize > maxPayloadLength) {
//       LOG.error(`${file.fileName} too large for the current model.`)
//       continue
//     }

//     if (currentBatchSize + currentFileSize > maxPayloadLength) {
//       prompts.push(PROMPT_CONTENT + JSON.stringify(currentBatch))
//       currentBatch = [file]
//       currentBatchSize = currentFileSize
//     } else {
//       currentBatch.push(file)
//       currentBatchSize += currentFileSize
//     }
//   }

//   if (currentBatch.length > 0) {
//     prompts.push(PROMPT_CONTENT + JSON.stringify(currentBatch))
//   }

//   return prompts
// }

export const chunkFilesToPrompts = (files: ReviewFile[], maxPromptLength: number): string[] => {
  const promptTemplate = formatPrompt()
  const maxPayloadLength = maxPromptLength - promptTemplate.length

  const prompts: string[] = []
  let currentBatch: PromptFile[] = []
  let currentBatchSize = 0

  const promptFiles = generatePrompt(files, maxPayloadLength)

  for (const file of promptFiles) {
    const currentFileSize = file.fileName.length + file.promptContent.length

    if (currentFileSize > maxPayloadLength) {
      LOG.error(`${file.fileName} is too large for the current model and will be skipped.`)
      continue
    }

    if (currentBatchSize + currentFileSize > maxPayloadLength) {
      prompts.push(promptTemplate + JSON.stringify(currentBatch))
      currentBatch = [file]
      currentBatchSize = currentFileSize
    } else {
      currentBatch.push(file)
      currentBatchSize += currentFileSize
    }
  }

  if (currentBatch.length > 0) {
    prompts.push(promptTemplate + JSON.stringify(currentBatch))
  }

  return prompts
}
