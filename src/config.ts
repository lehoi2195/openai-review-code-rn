import * as azdev from 'azure-devops-node-api'
import * as gitApiObject from 'azure-devops-node-api/GitApi'
import { LOG } from '~/utils/helpers'

export const getOpenAIApiKey = (): string => {
  if (!process.env.OPENAI_API_KEY) {
    LOG.error('Not found OPENAI_API_KEY')
  }

  return process.env.OPENAI_API_KEY ?? ''
}

export const getOpenAIModel = (): string => {
  if (!process.env.OPENAI_API_MODEL) {
    LOG.error('OPNot found ENAI_API_MODEL')
  }

  return process.env.OPENAI_API_MODEL ?? ''
}

export const gitAzdevEnvVariables = (): Record<string, string> => {
  const envVars = ['SYSTEM_PULLREQUEST_SOURCECOMMITID', 'BASE_SHA', 'API_TOKEN']
  const missingVars: string[] = []
  envVars.forEach((envVar) => process.env[envVar] ?? missingVars.push(envVar))

  if (missingVars.length > 0) {
    LOG.error(`Missing environment variables: ${missingVars.join(', ')}`)
    throw new Error('One or more Azure DevOps environment variables are not set')
  }

  return {
    azdevSha: process.env.SYSTEM_PULLREQUEST_SOURCECOMMITID ?? '',
    baseSha: process.env.BASE_SHA ?? '',
    azdevToken: process.env.API_TOKEN ?? '',
  }
}

let gitApi: gitApiObject.IGitApi | null = null

export const getGitApi = async (): Promise<gitApiObject.IGitApi> => {
  if (gitApi) {
    return gitApi
  }

  const envVars = [
    'SYSTEM_TEAMFOUNDATIONCOLLECTIONURI',
    'API_TOKEN',
    'SYSTEM_PULLREQUEST_PULLREQUESTID',
    'BUILD_REPOSITORY_ID',
    'SYSTEM_TEAMPROJECTID',
  ]
  const missingVars: string[] = []

  const env = envVars.reduce(
    (acc, varName) => {
      const value = process.env[varName]

      if (!value) {
        missingVars.push(varName)
      } else {
        acc[varName] = value
      }

      return acc
    },
    {} as Record<string, string>,
  )

  if (missingVars.length > 0) {
    LOG.error(`Missing environment variables: ${missingVars.join(', ')}`)
    throw new Error('One or more Azure DevOps environment variables are not set')
  }

  if (missingVars.length > 0) {
    LOG.error(`Missing environment variables: ${missingVars.join(', ')}`)
    throw new Error('One or more Azure DevOps environment variables are not set')
  }

  const authHandler = azdev.getPersonalAccessTokenHandler(env.API_TOKEN)
  const connection = new azdev.WebApi(env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI, authHandler)

  gitApi = await connection.getGitApi()

  return gitApi
}

export const getAzureDevOpsEnv = (): Record<string, string> => {
  return {
    serverUrl: process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI ?? '',
    pullRequestId: process.env.SYSTEM_PULLREQUEST_PULLREQUESTID ?? '',
    repositoryId: process.env.BUILD_REPOSITORY_ID ?? '',
    project: process.env.SYSTEM_TEAMPROJECTID ?? '',
  }
}
