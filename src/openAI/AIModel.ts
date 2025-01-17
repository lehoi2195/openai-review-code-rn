import { OpenAIChat } from 'langchain/llms/openai'
import { retryAsync } from 'ts-retry'
import { RETRY_COUNT } from '~/utils/constants'
import { handleFeedbacks, parseJSONFeedback } from '~/utils/convertFeedbackJson'
import { generateAIReport, LOG } from '~/utils/helpers'
import { AskAIResponse, IAIModel, IFeedback } from '~/utils/types'

export const askAI = async (prompts: string[], modelName: string, openAIApiKey: string): Promise<AskAIResponse> => {
  LOG.info('Asking AI...')

  const model = new AIModel({ modelName: modelName, temperature: 0.0, apiKey: openAIApiKey, provider: 'openai' })
  const feedbacks = await handleFeedbacks(model, prompts)

  return {
    feedbacks: feedbacks,
    markdownReport: generateAIReport(feedbacks),
  }
}

class AIModel {
  private model: OpenAIChat
  private retryCount: number

  constructor(state: IAIModel) {
    this.retryCount = RETRY_COUNT
    this.model = new OpenAIChat({ openAIApiKey: state.apiKey, modelName: state.modelName, temperature: state.temperature })
  }

  public async callModel(prompt: string): Promise<string> {
    return this.model.call(prompt)
  }

  public async callModelJSON(prompt: string): Promise<IFeedback[]> {
    return retryAsync(
      async () => {
        const modelResponse = await this.callModel(prompt)
        LOG.debug(`JSON response: ${modelResponse}`)
        try {
          const parsedObject = parseJSONFeedback(modelResponse)

          return parsedObject
        } catch (error) {
          LOG.error(`Error parsing JSON model: ${modelResponse}`, error)
          throw error
        }
      },
      {
        maxTry: this.retryCount,
        onError: (error) => {
          LOG.error(`Error in callModelJSON`, error)
        },
        onMaxRetryFunc: () => {
          throw new Error(`Couldn't call model after ${this.retryCount} tries with prompt: ${prompt}`)
        },
      },
    )
  }
}

export default AIModel
