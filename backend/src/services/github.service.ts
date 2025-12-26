import axios from 'axios';
import { logger } from '../utils/logger';

export class GitHubService {
  private baseURL = 'https://api.github.com';

  /**
   * Exchange GitHub OAuth code for access token
   */
  async getAccessToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      logger.error('Error getting GitHub access token:', error.message);
      throw new Error('Failed to authenticate with GitHub');
    }
  }

  /**
   * Get GitHub user information
   */
  async getUserInfo(accessToken: string) {
    try {
      const response = await axios.get(`${this.baseURL}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error getting GitHub user info:', error.message);
      throw new Error('Failed to get user information');
    }
  }

  /**
   * Get user's repositories
   */
  async getUserRepositories(accessToken: string) {
    try {
      const response = await axios.get(`${this.baseURL}/user/repos`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          sort: 'updated',
          per_page: 100,
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error getting repositories:', error.message);
      throw new Error('Failed to fetch repositories');
    }
  }

  /**
   * Get repository content
   */
  async getRepositoryContent(
    owner: string,
    repo: string,
    path: string = '',
    accessToken: string
  ) {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Error getting repository content:', error.message);
      throw new Error('Failed to fetch repository content');
    }
  }

  /**
   * Get file content (decoded from base64)
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    accessToken: string
  ): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.content) {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }

      return '';
    } catch (error: any) {
      logger.error(`Error getting file content for ${path}:`, error.message);
      return '';
    }
  }

  /**
   * Get repository tree (file structure)
   */
  async getRepositoryTree(
    owner: string,
    repo: string,
    branch: string,
    accessToken: string
  ) {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/git/trees/${branch}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            recursive: 1,
          },
        }
      );

      return response.data.tree;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      logger.error('Error getting repository tree:', errorMessage);
      throw new Error(`Failed to fetch repository structure: ${statusCode} - ${errorMessage}`);
    }
  }

  /**
   * Update file in repository
   */
  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha: string,
    branch: string,
    accessToken: string
  ) {
    try {
      const response = await axios.put(
        `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`,
        {
          message,
          content: Buffer.from(content).toString('base64'),
          sha,
          branch,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error(`Error updating file ${path}:`, error.message);
      throw new Error(`Failed to update file: ${path}`);
    }
  }

  /**
   * Create file in repository
   */
  async createFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string,
    accessToken: string
  ) {
    try {
      const response = await axios.put(
        `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`,
        {
          message,
          content: Buffer.from(content).toString('base64'),
          branch,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error(`Error creating file ${path}:`, error.message);
      throw new Error(`Failed to create file: ${path}`);
    }
  }

  /**
   * Get recent commits
   */
  async getRecentCommits(
    owner: string,
    repo: string,
    accessToken: string,
    count: number = 10
  ) {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/commits`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            per_page: count,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      logger.error('Error getting recent commits:', errorMessage);
      throw new Error(`Failed to fetch recent commits: ${statusCode} - ${errorMessage}`);
    }
  }
}

export const githubService = new GitHubService();
