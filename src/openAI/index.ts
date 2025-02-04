import { commentOnFile } from '~/utils/commentPullRequest'
import { GPT_MODEL_INFO } from '~/utils/constants'
import { filterFileSupport, LOG } from '~/utils/helpers'
import { IModelAI, ReviewFile } from '~/utils/types'
import { askAI } from './AIModel'
import { chunkFilesToPrompts } from './chunkPrompts'

export const reviewPullRequest = async (
  files: ReviewFile[],
  openAIApiKey: string,
  openAIModel: string,
): Promise<string | undefined> => {
  const filteredFiles = filterFileSupport(files)

  if (filteredFiles.length === 0) {
    LOG.info('No file to review!!')
    return
  }

  LOG.debug(`List file review: ${JSON.stringify(filteredFiles.map((file: ReviewFile) => file.fileName))}`)

  const modelExist = GPT_MODEL_INFO.find((info: IModelAI) => info.model === openAIModel)

  if (!modelExist) {
    throw new Error(
      `Model ${openAIModel} not found.\nModel supported ${JSON.stringify(GPT_MODEL_INFO.map((info: IModelAI) => info.model))}`,
    )
  }

  const prompts = chunkFilesToPrompts(filteredFiles, modelExist?.maxLength)

  LOG.debug(`Prompt used:\n ${prompts.toString()}`)

  const { markdownReport: response, feedbacks } = await askAI(prompts, openAIModel, openAIApiKey)

  LOG.debug(`feedbacks:`, JSON.stringify(feedbacks, null, 2), '\n\n')
  await commentOnFile(feedbacks)

  // check feedback riskLevel > 4 => reject pull request
  // const highRiskFeedback = feedbacks.filter(
  //   (item) => Number(item.riskLevel) > 3
  // );

  // if (highRiskFeedback.length) {
  //   LOG.error(
  //     `High risk item detected. Rejecting Pull Request: ${JSON.stringify(
  //       highRiskFeedback,
  //       null,
  //       2
  //     )}`
  //   );
  //   await rejectPullRequest(
  //     "Pull request rejected due to high risk feedback.",
  //     highRiskFeedback.map((item) => item.details).join("\n")
  //   );
  // }

  return response
}
