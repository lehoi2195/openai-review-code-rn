import { extname } from 'path'
import { Logger } from 'tslog'
import { IFeedback } from '~/utils/types'
import { EXCLUDE_KEYWORD, FILE_SUPPORT } from './constants'
import { ReviewFile } from './types'

export const LOG = new Logger({
  prettyLogTemplate: '{{logLevelName}}\t',
})

export const formatFeedbackDetail = (feedback: IFeedback): string => {
  return `\n**Risk Level ${feedback.riskLevel} - ${feedback.fileName}**\n\n${feedback.feedback}\n`
}

export const formatFeedbacksArray = (feedbacks: IFeedback[]): string => {
  return `\n${feedbacks.map(formatFeedbackDetail).join('\n---\n')}\n`
}

export const generateAIReport = (feedbacks: IFeedback[]): string => {
  return `\n${formatFeedbacksArray(feedbacks)}\n`
}

export const filterFileSupport = (files: ReviewFile[]): ReviewFile[] => {
  const filteredFiles = files.filter((file) => {
    const fileExt = extname(file.fileName)
    const fileIsSupported = FILE_SUPPORT.includes(fileExt)
    const excludedKeyword = !EXCLUDE_KEYWORD.some((keyword) => file.fileName.includes(keyword))

    return fileIsSupported && excludedKeyword && file.changedLines.trim() !== ''
  })

  return filteredFiles
}

// Encode feedbacks in a JSON string by applying URI encoding to the "feedback" field.
export const encodeAndCleanJSON = (jsonString: string): string => {
  const cleanString = jsonString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
  const regex = new RegExp(`"feedback"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'g')

  return cleanString.replace(regex, (_, value: string) => `"feedback": "${encodeURIComponent(value)}"`)
}

// Decode a URI-encoded string and replace encoded newlines with actual newlines.
export const decodeAndReplaceNewlines = (value: string): string => decodeURIComponent(value).replace(/\\n/g, '\n')

// Check if the input is a valid IFeedback object.
export const feedbackIsValid = (input: unknown): input is IFeedback => {
  if (typeof input === 'object' && input !== null) {
    const { fileName, riskLevel, feedback } = input as IFeedback
    return typeof fileName === 'string' && typeof riskLevel === 'number' && typeof feedback === 'string'
  }
  return false
}
