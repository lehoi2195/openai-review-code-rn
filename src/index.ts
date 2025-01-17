import 'module-alias/register'
import dotenv from 'dotenv'
import { getOpenAIApiKey, getOpenAIModel } from '~/config'
import { reviewPullRequest } from '~/openAI'
import { getListFilesChanges } from '~/utils/getListFilesChanges'
import { LOG } from '~/utils/helpers'

dotenv.config()

const main = async () => {
  try {
    LOG.info('Initializing environment...')

    const openAIApiKey = getOpenAIApiKey()
    const openAIModel = getOpenAIModel()
    const files = await getListFilesChanges()
    LOG.info('Review PR Started...')
    await reviewPullRequest(files, openAIApiKey, openAIModel)
    LOG.info('Review pull request completed successfully.')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    const stack = error instanceof Error ? error.stack : 'No stack trace available'

    LOG.error(`Main Error: ${message}`)

    if (stack) {
      LOG.debug(`Stack trace: ${stack}`)
    }

    process.exit(1)
  }
}

main()
