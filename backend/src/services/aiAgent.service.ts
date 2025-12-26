import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger';
import { diffGeneratorService } from './diffGenerator.service';

interface FileStructure {
  path: string;
  type: 'file' | 'dir';
  size?: number;
  language?: string;
}

interface RepositoryContext {
  name: string;
  description: string;
  fileStructure: FileStructure[];
  mainLanguage: string;
  frameworks: string[];
  dependencies: Record<string, string>;
}

interface FileChange {
  filePath: string;
  action: 'create' | 'update' | 'delete';
  reason: string;
  originalContent: string;
  modifiedContent: string;
  diff: string;
}

interface ModificationPlan {
  plan: string;
  changes: FileChange[];
  commitMessage: string;
  risk: 'low' | 'medium' | 'high';
  explanation: string;
}

export class AIAgentService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || ''
    });
  }

  /**
   * Analyze repository structure and create context
   */
  async analyzeRepository(
    fileStructure: FileStructure[],
    sampleFiles: { path: string; content: string }[]
  ): Promise<RepositoryContext> {
    try {
      // Detect main language
      const extensions = fileStructure
        .filter(f => f.type === 'file')
        .map(f => f.path.split('.').pop() || '')
        .filter(Boolean);

      const extensionCounts: Record<string, number> = {};
      extensions.forEach(ext => {
        extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
      });

      const mainLanguage = Object.entries(extensionCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

      // Detect frameworks from package.json or similar
      const packageFile = sampleFiles.find(f =>
        f.path === 'package.json' || f.path === 'requirements.txt' || f.path === 'pom.xml'
      );

      let frameworks: string[] = [];
      let dependencies: Record<string, string> = {};

      if (packageFile && packageFile.path === 'package.json') {
        try {
          const pkg = JSON.parse(packageFile.content);
          dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
          frameworks = Object.keys(dependencies).filter(dep =>
            ['react', 'vue', 'angular', 'express', 'next', 'nest'].some(fw =>
              dep.toLowerCase().includes(fw)
            )
          );
        } catch (error) {
          // Invalid JSON
        }
      }

      return {
        name: '',
        description: '',
        fileStructure,
        mainLanguage,
        frameworks,
        dependencies,
      };
    } catch (error: any) {
      logger.error('Error analyzing repository:', error.message);
      throw error;
    }
  }

  /**
   * Create modification plan from user prompt
   */
  async createModificationPlan(
    userPrompt: string,
    repositoryContext: RepositoryContext,
    relevantFiles: { path: string; content: string }[]
  ): Promise<ModificationPlan> {
    try {
      const filesContext = relevantFiles
        .map(f => `\n=== File: ${f.path} ===\n${f.content.substring(0, 3000)}`)
        .join('\n');

      const systemPrompt = `You are a professional software engineering AI agent integrated into a VS Code-like IDE.
Your role is to help users modify their code safely and intelligently.

CORE PRINCIPLES:
1. Always analyze the full context before making changes
2. Create a clear, step-by-step plan before modifying code
3. Make minimal, targeted changes that achieve the goal
4. Preserve existing code style, patterns, and conventions
5. Explain your reasoning clearly
6. Never delete or modify unrelated code
7. Validate syntax and imports
8. Generate meaningful, conventional commit messages

OUTPUT REQUIREMENTS:
- Provide complete file content (not snippets or placeholders)
- Use proper syntax for the detected language
- Follow existing code patterns and style
- Include necessary imports and dependencies
- Add helpful comments where appropriate

SAFETY:
- Risk assessment: low (documentation), medium (logic changes), high (architecture changes)
- Never introduce security vulnerabilities
- Validate all changes before applying`;

      const userMessage = `
REPOSITORY CONTEXT:
- Main Language: ${repositoryContext.mainLanguage}
- Frameworks: ${repositoryContext.frameworks.join(', ') || 'None detected'}
- File Structure (${repositoryContext.fileStructure.length} files):
${repositoryContext.fileStructure.slice(0, 50).map(f => `  ${f.type === 'dir' ? '📁' : '📄'} ${f.path}`).join('\n')}

RELEVANT FILES:
${filesContext}

USER REQUEST:
"${userPrompt}"

YOUR TASK:
Create a detailed modification plan. For each file that needs changes:
1. Explain WHY it needs to be modified
2. Provide the COMPLETE updated file content
3. Ensure the code is syntactically correct and functional

Respond in JSON format:
{
  "plan": "Detailed step-by-step plan explaining what you'll do and why",
  "changes": [
    {
      "filePath": "path/to/file",
      "action": "create" | "update" | "delete",
      "reason": "Clear explanation of why this change is needed",
      "modifiedContent": "COMPLETE file content after changes"
    }
  ],
  "commitMessage": "feat: clear, conventional commit message",
  "risk": "low" | "medium" | "high",
  "explanation": "Overall summary of what was accomplished"
}`;

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [{
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + userMessage }]
        }]
      });

      const text = result.text;
      if (!text) {
        throw new Error('Empty AI response');
      }

      // Extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const response = JSON.parse(jsonMatch[0]);

      // Generate diffs for each change
      const changesWithDiff: FileChange[] = [];

      for (const change of response.changes) {
        const relevantFile = relevantFiles.find(f => f.path === change.filePath);
        const originalContent = relevantFile?.content || '';

        const diff = diffGeneratorService.generateDiff(
          change.filePath,
          originalContent,
          change.modifiedContent
        );

        changesWithDiff.push({
          filePath: change.filePath,
          action: change.action,
          reason: change.reason,
          originalContent,
          modifiedContent: change.modifiedContent,
          diff,
        });
      }

      logger.info('AI Agent created modification plan', {
        filesChanged: changesWithDiff.length,
        risk: response.risk,
      });

      return {
        plan: response.plan,
        changes: changesWithDiff,
        commitMessage: response.commitMessage,
        risk: response.risk,
        explanation: response.explanation,
      };
    } catch (error: any) {
      logger.error('Error creating modification plan:', error.message);
      throw new Error('Failed to create modification plan: ' + error.message);
    }
  }

  /**
   * Validate code syntax before applying changes
   */
  async validateCode(
    filePath: string,
    content: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const extension = filePath.split('.').pop()?.toLowerCase();
      const errors: string[] = [];

      // Basic validation based on file type
      switch (extension) {
        case 'json':
          try {
            JSON.parse(content);
          } catch (e: any) {
            errors.push(`JSON syntax error: ${e.message}`);
          }
          break;

        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          // Check for basic syntax issues
          if (content.includes('import') && !content.match(/import\s+.*\s+from\s+['"].*['"]/)) {
            errors.push('Possible import syntax error');
          }
          // Check for unclosed braces
          const openBraces = (content.match(/\{/g) || []).length;
          const closeBraces = (content.match(/\}/g) || []).length;
          if (openBraces !== closeBraces) {
            errors.push('Mismatched braces detected');
          }
          break;

        case 'html':
          // Check for basic HTML structure
          if (!content.includes('<!DOCTYPE') && !content.includes('<html')) {
            errors.push('Warning: Missing DOCTYPE or html tag');
          }
          break;
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error: any) {
      logger.error('Error validating code:', error.message);
      return {
        valid: false,
        errors: [error.message],
      };
    }
  }

  /**
   * Refine changes based on user feedback
   */
  async refineChanges(
    originalPlan: ModificationPlan,
    userFeedback: string
  ): Promise<ModificationPlan> {
    try {
      const prompt = `
ORIGINAL PLAN:
${JSON.stringify(originalPlan, null, 2)}

USER FEEDBACK:
"${userFeedback}"

YOUR TASK:
Refine the plan based on the user's feedback. Maintain the same JSON structure.
Only modify the parts that the user requested changes to.

Respond in the same JSON format as before.`;

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
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

      const response = JSON.parse(jsonMatch[0]);

      // Regenerate diffs
      const changesWithDiff: FileChange[] = response.changes.map((change: any) => ({
        ...change,
        diff: diffGeneratorService.generateDiff(
          change.filePath,
          change.originalContent,
          change.modifiedContent
        ),
      }));

      return {
        ...response,
        changes: changesWithDiff,
      };
    } catch (error: any) {
      logger.error('Error refining changes:', error.message);
      throw error;
    }
  }
}

export const aiAgentService = new AIAgentService();
