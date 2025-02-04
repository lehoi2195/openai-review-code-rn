import { getArgPromptReview } from '~/config'
import { LOG } from './helpers'

export const SIGNATURE = '#### OpenAI Review'
export const RETRY_COUNT = 2

export const GPT_MODEL_INFO = [
  { model: 'gpt-4o-mini', maxLength: 300000 }, //128k tokens
  { model: 'gpt-4o', maxLength: 300000 }, //128k tokens
  { model: 'gpt-4-turbo', maxLength: 300000 }, //128k tokens
  { model: 'gpt-4-turbo-preview', maxLength: 300000 }, //128k tokens
  { model: 'gpt-4', maxLength: 21000 }, //8k tokens
  { model: 'gpt-4-32k', maxLength: 90000 }, //32k tokens
  { model: 'gpt-3.5-turbo', maxLength: 9000 }, //4k tokens
  { model: 'gpt-3.5-turbo-16k', maxLength: 45000 }, //16k tokens
]

export const LANGUAGE_PROGRAMMING: { [key: string]: string } = {
  '.js': 'JavaScript',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.jsx': 'JavaScript',
}

export const FILE_SUPPORT = Object.keys(LANGUAGE_PROGRAMMING)
export const EXCLUDE_KEYWORD = ['types']
export const LIMIT_FEEDBACK = 10

export const formatPrompt = (): string => {
  const { prompts, language, riskLevel, riskScoring, configRules, otherCheck, guidelines, suggestions, notes } =
    getArgPromptReview()
  if (prompts) {
    LOG.info(`Prompt content provided by user`)
    return prompts
  }

  return `
You are an expert ${language} developer. Your task is to review a set of pull requests containing filenames and partial code snippets.

### Review Requirements:
1. **Risk Scoring ${riskLevel}**:
   ${riskScoring}

2. **Coding Rules to Check**:
   ${configRules}

3. **Other Checks**:
   ${otherCheck}

4. **Feedback Guidelines**:
   ${guidelines}

5. **Code Suggestions**:
   ${suggestions}

### Feedback Format:
Return the feedback as a valid JSON array, structured as:
\[
  {
    "fileName": "string",
    "riskLevel": "number",
    "details": "string"
    "suggestions": "string"
  }
\]

### Notes:
   ${notes}

### Input Format:
Provide the filenames and file contents as a JSON array. Review the files based on this input.


`.trim()
}
