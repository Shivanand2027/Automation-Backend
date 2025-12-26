import { githubService } from './github.service';
import { logger } from '../utils/logger';

export class FileOperationService {
  /**
   * Read a single file from repository
   */
  async readFile(
    owner: string,
    repo: string,
    path: string,
    token: string
  ): Promise<string> {
    try {
      return await githubService.getFileContent(owner, repo, path, token);
    } catch (error: any) {
      logger.error(`Error reading file ${path}:`, error.message);
      throw error;
    }
  }

  /**
   * Write file to repository (create or update)
   */
  async writeFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string,
    token: string,
    sha?: string
  ): Promise<any> {
    try {
      if (sha) {
        return await githubService.updateFile(
          owner,
          repo,
          path,
          content,
          message,
          sha,
          branch,
          token
        );
      } else {
        return await githubService.createFile(
          owner,
          repo,
          path,
          content,
          message,
          branch,
          token
        );
      }
    } catch (error: any) {
      logger.error(`Error writing file ${path}:`, error.message);
      throw error;
    }
  }

  /**
   * Get repository file tree
   */
  async getFileTree(
    owner: string,
    repo: string,
    branch: string,
    token: string
  ): Promise<any[]> {
    try {
      return await githubService.getRepositoryTree(owner, repo, branch, token);
    } catch (error: any) {
      logger.error('Error getting file tree:', error.message);
      throw error;
    }
  }

  /**
   * Get file SHA (needed for updates)
   */
  async getFileSha(
    owner: string,
    repo: string,
    path: string,
    token: string
  ): Promise<string> {
    try {
      const fileData = await githubService.getRepositoryContent(
        owner,
        repo,
        path,
        token
      );
      return fileData.sha;
    } catch (error: any) {
      logger.error(`Error getting SHA for ${path}:`, error.message);
      throw error;
    }
  }

  /**
   * Build hierarchical tree structure from flat file list
   */
  buildFileTree(files: any[]): any[] {
    const tree: any[] = [];
    const pathMap = new Map<string, any>();

    // Sort files by path
    files.sort((a, b) => a.path.localeCompare(b.path));

    for (const file of files) {
      const parts = file.path.split('/');
      const fileName = parts[parts.length - 1];

      const node: any = {
        name: fileName,
        path: file.path,
        type: file.type === 'blob' ? 'file' : 'folder',
        size: file.size,
      };

      if (parts.length === 1) {
        // Root level
        tree.push(node);
        pathMap.set(file.path, node);
      } else {
        // Nested level - find parent
        const parentPath = parts.slice(0, -1).join('/');
        let parent = pathMap.get(parentPath);

        if (!parent) {
          // Create parent folders if they don't exist
          for (let i = 1; i < parts.length; i++) {
            const currentPath = parts.slice(0, i).join('/');
            if (!pathMap.has(currentPath)) {
              const folderNode = {
                name: parts[i - 1],
                path: currentPath,
                type: 'folder',
                children: [],
              };

              if (i === 1) {
                tree.push(folderNode);
              } else {
                const grandParentPath = parts.slice(0, i - 1).join('/');
                const grandParent = pathMap.get(grandParentPath);
                if (grandParent) {
                  grandParent.children = grandParent.children || [];
                  grandParent.children.push(folderNode);
                }
              }
              pathMap.set(currentPath, folderNode);
            }
          }
          parent = pathMap.get(parentPath);
        }

        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
          pathMap.set(file.path, node);
        }
      }
    }

    return tree;
  }

  /**
   * Detect file language from extension
   */
  detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sh: 'shell',
      bash: 'shell',
      sql: 'sql',
      graphql: 'graphql',
      dockerfile: 'dockerfile',
    };

    return languageMap[ext] || 'plaintext';
  }
}

export const fileOperationService = new FileOperationService();
