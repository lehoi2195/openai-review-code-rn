import * as azdev from 'azure-devops-node-api'
import * as gitApiObject from 'azure-devops-node-api/GitApi'
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces'
import { getAzureDevOpsEnv, getGitApi } from '~/config'
import { EMOJI_MAP, SIGNATURE } from '~/utils/constants'
import { LOG } from '~/utils/helpers'
import { IFeedback } from '~/utils/types'

const gitAzdevEnvVariables = (): Record<string, string> => {
  const envVars = [
    'SYSTEM_TEAMFOUNDATIONCOLLECTIONURI',
    'API_TOKEN',
    'SYSTEM_PULLREQUEST_PULLREQUESTID',
    'BUILD_REPOSITORY_ID',
    'SYSTEM_TEAMPROJECTID',
  ]
  const missingVars: string[] = []
  envVars.forEach((envVar) => process.env[envVar] ?? missingVars.push(envVar))

  if (missingVars.length > 0) {
    LOG.error(`Cannot find variables : ${missingVars.join(', ')}`)
    throw new Error('Variables not set')
  }

  return {
    serverUrl: process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI ?? '',
    azdevToken: process.env.API_TOKEN ?? '',
    pullRequestId: process.env.SYSTEM_PULLREQUEST_PULLREQUESTID ?? '',
    project: process.env.SYSTEM_TEAMPROJECTID ?? '',
    repositoryId: process.env.BUILD_REPOSITORY_ID ?? '',
  }
}

export const commentOnPRAzdev = async (comment: string): Promise<void> => {
  try {
    const { serverUrl, azdevToken, pullRequestId, repositoryId, project } = gitAzdevEnvVariables()

    const pullRequestIdNumber = Number(pullRequestId)

    const authHandler = azdev.getPersonalAccessTokenHandler(azdevToken)
    const connection: azdev.WebApi = new azdev.WebApi(serverUrl, authHandler)

    const git: gitApiObject.IGitApi = await connection.getGitApi()

    const commentThread = <GitInterfaces.GitPullRequestCommentThread>{
      comments: [<GitInterfaces.Comment>{ content: `${SIGNATURE} - Summary PR\n\n${comment}\n\n` }],
    }

    await git.createThread(commentThread, repositoryId, pullRequestIdNumber, project)
  } catch (error) {
    LOG.error(`Comment on PR Failed: ${JSON.stringify(error)}`)
    throw error
  }
}

const normalizeFilePath = (absolutePath: string): string => {
  const srcIndex = absolutePath.indexOf('/src')
  if (srcIndex !== -1) {
    return absolutePath.substring(srcIndex)
  }

  return absolutePath
}

export const commentOnFile = async (feedbacks: IFeedback[]): Promise<void> => {
  try {
    const { pullRequestId, repositoryId, project } = getAzureDevOpsEnv()
    const gitApi = await getGitApi()

    const pullRequestIdNumber = Number(pullRequestId)

    for (const feedback of feedbacks) {
      try {
        const commentThread = <GitInterfaces.GitPullRequestCommentThread>{
          comments: [
            <GitInterfaces.Comment>{
              content: `**${EMOJI_MAP[feedback.riskLevel]}  - Risk Level ${feedback.riskLevel}**\n\n\n${
                feedback.feedback
              }\n\n ${SIGNATURE}`,
            },
          ],
          status: GitInterfaces.CommentThreadStatus.Active,
          threadContext: {
            filePath: normalizeFilePath(feedback.fileName),
            rightFileStart: { line: 1, offset: 1 },
            rightFileEnd: { line: 1, offset: 1 },
          },
        }

        await gitApi.createThread(commentThread, repositoryId, pullRequestIdNumber, project)
        LOG.info(`Success to comment on ${normalizeFilePath(feedback.fileName)}`)
      } catch (error) {
        LOG.error(`Failed to comment on ${normalizeFilePath(feedback.fileName)}: ${JSON.stringify(error)}`)
        throw error
      }
    }
  } catch (error) {
    LOG.error(`Failed to comment on File: ${JSON.stringify(error)}`)
    throw error
  }
}

export const rejectPullRequest = async (reason: string, feedback: string): Promise<void> => {
  const { serverUrl, azdevToken, pullRequestId, project, repositoryId } = gitAzdevEnvVariables()

  const authHandler = azdev.getPersonalAccessTokenHandler(azdevToken)
  const connection = new azdev.WebApi(serverUrl, authHandler)

  const gitApi = await connection.getGitApi()

  const pullRequestIdNumber = Number(pullRequestId)

  const updatedPullRequest = <GitInterfaces.GitPullRequest>{
    status: GitInterfaces.PullRequestStatus.Abandoned,
    title: `Rejected: ${reason}`,
    description: `${feedback}`,
  }

  await gitApi.updatePullRequest(updatedPullRequest, repositoryId, pullRequestIdNumber, project)
}
