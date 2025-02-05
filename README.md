# AI Code Review with GPT

## Overview
This module integrates AI-powered code review into your CI/CD pipeline using GPT. It automatically reviews pull requests and provides structured feedback on code quality, security risks, and best practices.

## Features
- Automated AI code review for pull requests.
- Customizable review prompts based on project requirements.
- Supports multiple programming languages.
- Identifies security vulnerabilities, performance issues, and ESLint violations.
- Provides structured JSON feedback.

## Prerequisites
Before using this module, ensure you have the following environment variables set:

### **Required Variables**
| Variable Name               | Description |
|-----------------------------|-------------|
| `AZURE_PERSONAL_ACCESS_TOKEN` | Required for authentication with Azure DevOps. |
| `OPENAI_API_KEY`             | API key for OpenAI GPT model. |
| `OPENAI_API_MODEL`           | OpenAI model to use for code review. |

### **Optional Variables**
| Variable Name                 | Description |
|--------------------------------|-------------|
| `PROJECT_ROOT_FOLDER`         | Root directory of the project to locate the reviewed files for comments. |
| `PROMPT_PATH_FILE`            | This path file containing the prompts contents. If provided, content in file is used as the AI review prompt. |
| `LANGUAGE_REVIEW`             | Programming language of the reviewed code. |
| `RISK_LEVEL_REVIEW`           | Risk assessment level (1-5). |
| `RISK_SCORING_REVIEW`         | Risk scoring criteria. |
| `CONFIG_RULES_REVIEW`         | ESLint or other coding standards applicable. |
| `FEEDBACK_GUIDELINES_REVIEW`  | Guidelines for structuring feedback. |
| `CODE_SUGGESTIONS_REVIEW`     | Suggestions for improving the code. |

## Review Prompt Selection
### **Custom Prompt (if all required variables are set)**
If `LANGUAGE_REVIEW`, `RISK_LEVEL_REVIEW`, `RISK_SCORING_REVIEW`, `CONFIG_RULES_REVIEW`, `FEEDBACK_GUIDELINES_REVIEW`, and `CODE_SUGGESTIONS_REVIEW` are all provided, the following prompt is used:

```plaintext
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
    "details": "string",
    "suggestions": "string"
  }
\]

### Notes:
   ${notes}

### Input Format:
Provide the filenames and file contents as a JSON array. Review the files based on this input.
```

### **Fallback Prompt**
If the required variables are missing, the module defaults to using `PROMPT_DEFAULT` defined in the code.

## Installation & Usage

### **Installation**
Example for reviewing **React Native** code. To install the required package, run one of the following commands:
```sh
npm install gpt-review-code
```
Or using Yarn:
```sh
yarn add gpt-review-code
```

### **Pipeline Configuration**
The following is an **example configuration** for integrating AI Code Review into your **Azure DevOps pipeline**. This example runs on **pool Default** and **Self Agent Host (local machine)** for reviewing **React Native** code.

```yaml
name: AI Code Review with GPT

trigger:
  - main
pr:
  branches:
    include:
      - main

pool:
  name: Default

stages:
  - stage: GTP_Review
    displayName: Code Review with GPT
    jobs:
      - job: code_review_gpt
        displayName: GPT Review Code
        steps:
          - checkout: self
            persistCredentials: 'true'
            clean: 'true'
            fetchDepth: '0'

          - task: UseNode@1
            inputs:
              version: '18.x'

          - script: |
              npm install --force
            displayName: 'Install Dependencies'

          - script: |
              echo "Calculating SOURCE_COMMIT_ID..."
              SYSTEM_PULLREQUEST_SOURCECOMMITID=$(git rev-parse HEAD)
              echo "SYSTEM_PULLREQUEST_SOURCECOMMITID=$SYSTEM_PULLREQUEST_SOURCECOMMITID" >> $(Build.ArtifactStagingDirectory)/source_commit_id.txt
            displayName: 'Calculate Source Commit ID'

          - script: |
              export SYSTEM_PULLREQUEST_SOURCECOMMITID=$(cat $(Build.ArtifactStagingDirectory)/source_commit_id.txt)
              echo "SYSTEM_PULLREQUEST_SOURCECOMMITID=$SYSTEM_PULLREQUEST_SOURCECOMMITID"
            displayName: 'Load Source Commit ID'

          - script: |
              echo "Calculating BASE_SHA..."
              export BASE_SHA=$(git merge-base origin/main HEAD)
              echo "##vso[task.setvariable variable=BASE_SHA]$BASE_SHA"
              echo "BASE_SHA=$BASE_SHA"
            displayName: 'Calculate BASE_SHA'

         - script: |
              if [ ! -f "$(Build.SourcesDirectory)/prompts_review.txt" ]; then
                echo "⚠️ Warning: Prompt file not found!"
              else
                echo "✅ Prompt file exists."
              fi
            displayName: 'Check if prompts_review.txt exists'

          - script: |
              npx ai-code-review review
            env:
              SYSTEM_PULLREQUEST_SOURCECOMMITID: $(SYSTEM_PULLREQUEST_SOURCECOMMITID)
              API_TOKEN: $(AZURE_PERSONAL_ACCESS_TOKEN)
              OPENAI_API_KEY: $(OPENAI_API_KEY)
              BASE_SHA: $(BASE_SHA)
              OPENAI_API_MODEL: $(OPENAI_API_MODEL)
              PROJECT_ROOT_FOLDER: 'src'
              PROMPT_PATH_FILE: '$(Build.SourcesDirectory)/prompts_review.txt'
            workingDirectory: $(Build.SourcesDirectory)
            displayName: 'Run AI Code Review'
```

## **Troubleshooting**
### **Common Issues & Solutions**
| Issue | Solution |
|--------|----------|
| Missing environment variables | Ensure all required variables are set in the pipeline or `.env` file. |
| OpenAI API errors | Verify that the `OPENAI_API_KEY` is correct and has access to the model specified in `OPENAI_API_MODEL`. |
| Review prompt is incorrect | Check if `PROMPT_PATH_FILE` is set; otherwise, ensure all prompt-related variables are provided. |

## **License**
This project was inspired by [Code Review GPT](https://github.com/marketplace/actions/code-review-gpt),

---
This README provides all necessary details for setting up and using the AI-powered code review module in Azure DevOps.
