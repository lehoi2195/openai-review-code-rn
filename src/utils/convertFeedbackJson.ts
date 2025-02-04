import AIModel from '~/openAI/AIModel'
import { LIMIT_FEEDBACK } from './constants'
import { decodeAndReplaceNewlines, encodeAndCleanJSON, feedbackIsValid, formatFeedbacksArray, LOG } from './helpers'
import { IFeedback } from './types'

// Parse a JSON string into an array of IFeedback objects, decoding feedbacks and ensuring correct structure.
export const parseJSONFeedback = (jsonString: string): IFeedback[] => {
  let encodedJsonString = jsonString.trim().startsWith('```json') ? jsonString.trim().slice(8, -4) : jsonString.trim()

  encodedJsonString = encodeAndCleanJSON(encodedJsonString)

  const parsedObject: unknown = JSON.parse(encodedJsonString)

  if (Array.isArray(parsedObject) && parsedObject.every(feedbackIsValid)) {
    parsedObject.forEach((item: IFeedback) => {
      item.details = decodeAndReplaceNewlines(item.details)
    })

    return parsedObject
  } else {
    throw new Error(`The shape result JSON object was incorrect. Object returned was: ${JSON.stringify(parsedObject, null, 2)}`)
  }
}

export const handleFeedbacks = async (model: AIModel, prompts: string[]): Promise<IFeedback[]> => {
  try {
    const feedbackResults = await Promise.allSettled(
      prompts.map(async (prompt) => {
        try {
          return await model.callModelJSON(prompt)
        } catch (error) {
          LOG.error(`Error in callModalJSON prompt`, error)
          process.exit(1)
        }
      }),
    )

    const feedbacks = feedbackResults.reduce<IFeedback[]>((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.push(...result.value)
      }
      return acc
    }, [])

    const worstFeedbacks = feedbacks
      .map((feedback) => ({
        ...feedback,
        weight: feedback.riskLevel + Math.random(),
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, LIMIT_FEEDBACK)
      .map(({ weight, ...rest }) => rest)

    LOG.info(formatFeedbacksArray(worstFeedbacks))

    return worstFeedbacks
  } catch (error) {
    LOG.error(`Error in handleFeedbacks`, error)
    process.exit(1)
  }
}
