import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger';

export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || ''
    });
  }

  /**
   * Analyze repository and suggest meaningful improvements
   */
  async analyzeRepository(repositoryData: {
    name: string;
    description: string;
    readme: string;
    fileStructure: string[];
    recentCommits: any[];
    sampleCode?: string;
  }): Promise<{
    improvementType: string;
    targetFile: string;
    suggestion: string;
    newContent: string;
    commitMessage: string;
  }> {
    try {
      const prompt = `
You are an AI assistant helping to improve a GitHub repository through meaningful, educational changes.

Repository Information:
- Name: ${repositoryData.name}
- Description: ${repositoryData.description}
- File Structure: ${repositoryData.fileStructure.slice(0, 50).join(', ')}
- Recent Commits: ${repositoryData.recentCommits.slice(0, 3).map(c => c.commit.message).join(', ')}

README Content (first 500 chars):
${repositoryData.readme.substring(0, 500)}

${repositoryData.sampleCode ? `Sample Code:\n${repositoryData.sampleCode.substring(0, 500)}` : ''}

Your task is to suggest ONE meaningful improvement that can be automated. Options include:
1. Improve README documentation (add sections, clarify instructions, add examples)
2. Add inline code comments to explain complex logic
3. Create or update a CONTRIBUTING.md file
4. Add a CODE_OF_CONDUCT.md file
5. Improve existing documentation files
6. Add JSDoc/docstring comments to functions
7. Create or update a CHANGELOG.md

IMPORTANT RULES:
- Make REAL, meaningful improvements only
- Do NOT suggest trivial changes
- Focus on documentation and code clarity
- Ensure changes add educational value
- Provide complete new file content
- Keep commit messages clear and descriptive

Respond in JSON format:
{
  "improvementType": "readme_improvement|code_documentation|new_file",
  "targetFile": "path/to/file",
  "suggestion": "Brief description of the improvement",
  "newContent": "Complete new file content or updated content",
  "commitMessage": "Clear commit message (e.g., 'docs: improve README installation section')"
}
`;

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = result.text;

      // Extract JSON from response
      if (!text) {
        throw new Error('Empty AI response');
      }
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      logger.info('AI analysis completed', {
        improvementType: parsedResponse.improvementType,
        targetFile: parsedResponse.targetFile,
      });

      return parsedResponse;
    } catch (error: any) {
      logger.error('Error in AI analysis:', error.message);
      throw new Error('Failed to analyze repository with AI');
    }
  }

  /**
   * Generate improvement for a specific file
   */
  async improveFileContent(
    fileName: string,
    currentContent: string,
    fileType: string
  ): Promise<{
    improvedContent: string;
    changeDescription: string;
    commitMessage: string;
  }> {
    try {
      const prompt = `
You are improving a file in a GitHub repository. Make meaningful, educational improvements.

File: ${fileName}
File Type: ${fileType}
Current Content (first 1000 chars):
${currentContent.substring(0, 1000)}

Suggest ONE meaningful improvement:
- For README: Add missing sections, improve clarity, add examples
- For code: Add helpful comments, improve documentation
- For documentation: Enhance explanations, add examples

Respond in JSON format:
{
  "improvedContent": "Complete improved file content",
  "changeDescription": "What was improved",
  "commitMessage": "Clear commit message following conventional commits"
}
`;

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = result.text;

      if (!text) {
        throw new Error('Empty AI response');
      }
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      logger.error('Error improving file content:', error.message);
      throw new Error('Failed to improve file content');
    }
  }

  /**
   * Validate that a change is meaningful (not trivial or fake)
   */
  async validateChange(
    originalContent: string,
    newContent: string
  ): Promise<boolean> {
    // Basic validation rules
    if (originalContent === newContent) {
      return false; // No change
    }

    const originalLines = originalContent.split('\n').length;
    const newLines = newContent.split('\n').length;
    const lineDifference = Math.abs(newLines - originalLines);

    // Must have at least 3 lines changed
    if (lineDifference < 3 && newContent.length - originalContent.length < 50) {
      return false; // Change too small
    }

    return true;
  }

  /**
   * Process custom user prompt and analyze entire repository
   */
  async processCustomPrompt(
    customPrompt: string,
    repositoryData: {
      name: string;
      description: string;
      readme: string;
      fileStructure: { path: string; type: string }[];
      allFiles: { path: string; content: string }[];
    }
  ): Promise<{
    changes: Array<{
      action: 'create' | 'update' | 'delete';
      filePath: string;
      content: string;
      reason: string;
    }>;
    summary: string;
    commitMessage: string;
  }> {
    try {
      // Prepare file contents for AI
      const fileContents = repositoryData.allFiles
        .map(f => `File: ${f.path}\n\`\`\`\n${f.content.substring(0, 2000)}\n\`\`\``)
        .join('\n\n');

      const prompt = `
You are an AI assistant that helps developers by analyzing their entire repository and making code changes based on custom instructions.

CUSTOM USER INSTRUCTION:
"${customPrompt}"

REPOSITORY INFORMATION:
- Name: ${repositoryData.name}
- Description: ${repositoryData.description}

README:
${repositoryData.readme.substring(0, 1000)}

FILE STRUCTURE:
${repositoryData.fileStructure.map(f => f.path).join('\n')}

ALL FILE CONTENTS:
${fileContents.substring(0, 15000)}

YOUR TASK:
Analyze the user's instruction and the entire repository. Then:
1. Determine what files need to be created, updated, or deleted
2. Generate the complete content for each file
3. Provide a clear explanation for each change
4. Create a meaningful commit message

IMPORTANT:
- Analyze ALL files provided, not just samples
- Make changes that fulfill the user's exact request
- Provide COMPLETE file content, not snippets
- If creating new files, provide full working code
- If updating files, provide the complete updated content
- Be practical and create working, production-ready code

Respond in JSON format:
{
  "changes": [
    {
      "action": "create" | "update" | "delete",
      "filePath": "path/to/file",
      "content": "Complete file content (empty string for delete)",
      "reason": "Why this change is needed"
    }
  ],
  "summary": "Overall summary of all changes made",
  "commitMessage": "Clear commit message describing the changes"
}
`;

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = result.text;

      if (!text) {
        throw new Error('Empty AI response');
      }

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      logger.info('Custom prompt processed', {
        changesCount: parsedResponse.changes?.length || 0,
        prompt: customPrompt.substring(0, 100),
      });

      return parsedResponse;
    } catch (error: any) {
      logger.error('Error processing custom prompt:', error.message);
      throw new Error('Failed to process custom prompt: ' + error.message);
    }
  }
}

export const aiService = new AIService();
