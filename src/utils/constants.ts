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
  '.py': 'Python',
  '.sh': 'Shell',
  '.go': 'Go',
  '.rs': 'Rust',
  '.dart': 'Dart',
  '.php': 'PHP',
  '.cpp': 'C++',
  '.h': 'C++',
  '.cxx': 'C++',
  '.hpp': 'C++',
  '.hxx': 'C++',
  '.cs': 'C#',
  '.rb': 'Ruby',
  '.kt': 'Kotlin',
  '.kts': 'Kotlin',
  '.java': 'Java',
  '.vue': 'Vue',
  '.tf': 'Terraform',
  '.hcl': 'Terraform',
  '.swift': 'Swift',
}

export const POSSIBLE_FOLDER = ['src', 'app', 'services', 'server', 'source']

export const FILE_SUPPORT = Object.keys(LANGUAGE_PROGRAMMING)
export const EXCLUDE_KEYWORD = ['types']
export const LIMIT_FEEDBACK = 10
