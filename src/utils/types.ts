export type AskAIResponse = {
  markdownReport: string
  feedbacks: IFeedback[]
}

export type ReviewFile = {
  fileName: string
  fileContent: string
  changedLines: string
}

export type PromptFile = {
  fileName: string
  promptContent: string
}

export type IFeedback = {
  fileName: string
  riskLevel: number
  details: string
  suggestions?: string
}

export type IModelAI = {
  model: string
  maxLength: number
}

export interface IAIModel {
  modelName: string
  provider: string
  temperature: number
  apiKey: string
  retryCount?: number
}
