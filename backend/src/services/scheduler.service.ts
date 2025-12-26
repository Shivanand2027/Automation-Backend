import cron from 'node-cron';
import { Repository } from '../models/Repository.model';
import { User } from '../models/User.model';
import { CommitLog } from '../models/CommitLog.model';
import { githubService } from './github.service';
import { aiService } from './ai.service';
import { logger } from '../utils/logger';

export class SchedulerService {
  private cronJob: cron.ScheduledTask | null = null;

  /**
   * Initialize the scheduler
   */
  initialize() {
    const schedule = process.env.AUTOMATION_CRON_SCHEDULE || '0 0 * * *';
    
    logger.info(`Initializing scheduler with schedule: ${schedule}`);

    this.cronJob = cron.schedule(schedule, async () => {
      logger.info('Running scheduled automation task');
      await this.runAutomation();
    });

    logger.info('Scheduler initialized successfully');
  }

  /**
   * Run automation for all enabled repositories
   */
  async runAutomation() {
    try {
      const repositories = await Repository.find({
        automationEnabled: true,
      }).populate('userId');

      logger.info(`Found ${repositories.length} repositories with automation enabled`);

      for (const repo of repositories) {
        try {
          await this.processRepository(repo);
        } catch (error: any) {
          logger.error(`Error processing repository ${repo.fullName}:`, error.message);
        }
      }
    } catch (error: any) {
      logger.error('Error in automation run:', error.message);
    }
  }

  /**
   * Process a single repository
   */
  async processRepository(repository: any) {
    const user = await User.findById(repository.userId);
    
    if (!user) {
      logger.error(`User not found for repository ${repository.fullName}`);
      return;
    }

    logger.info(`Processing repository: ${repository.fullName}`);

    try {
      // Check if repository is empty first
      let fileTree: any[] = [];
      let recentCommits: any[] = [];
      let isEmptyRepo = false;

      try {
        fileTree = await githubService.getRepositoryTree(
          repository.owner,
          repository.name,
          repository.defaultBranch,
          user.accessToken
        );
        recentCommits = await githubService.getRecentCommits(
          repository.owner,
          repository.name,
          user.accessToken,
          5
        );
      } catch (error: any) {
        // Repository is likely empty (409 status)
        const errorMsg = error.message || JSON.stringify(error);
        if (errorMsg.includes('409') || errorMsg.includes('404') || errorMsg.includes('Git Repository is empty')) {
          isEmptyRepo = true;
          logger.info(`Repository ${repository.fullName} appears to be empty, will create initial README`);
        } else {
          throw error;
        }
      }

      // Handle empty repository - create initial README
      if (isEmptyRepo || fileTree.length === 0) {
        const initialReadme = `# ${repository.name}

${repository.description || 'A new repository'}

## About

This repository was initialized by AI-Powered GitHub Automation.

## Getting Started

Start adding your code and documentation here!

---
*This README was auto-generated*`;

        const commitResult = await githubService.createFile(
          repository.owner,
          repository.name,
          'README.md',
          initialReadme,
          '🚀 Initialize repository with README',
          repository.defaultBranch,
          user.accessToken
        );

        await CommitLog.create({
          repositoryId: repository._id,
          commitSha: commitResult.commit.sha,
          commitMessage: '🚀 Initialize repository with README',
          filesChanged: ['README.md'],
          aiAnalysis: 'Created initial README for empty repository',
          status: 'success',
        });

        repository.lastAutomationRun = new Date();
        await repository.save();

        logger.info(`Created initial README for ${repository.fullName}`);
        return;
      }

      // 1. Fetch repository data
      const readme = await this.getReadmeContent(repository, user.accessToken);

      // Get sample code file
      const codeFiles = fileTree.filter((file: any) => 
        file.type === 'blob' && 
        (file.path.endsWith('.js') || 
         file.path.endsWith('.ts') || 
         file.path.endsWith('.py') ||
         file.path.endsWith('.java'))
      );

      let sampleCode = '';
      if (codeFiles.length > 0) {
        const randomCodeFile = codeFiles[Math.floor(Math.random() * codeFiles.length)];
        sampleCode = await githubService.getFileContent(
          repository.owner,
          repository.name,
          randomCodeFile.path,
          user.accessToken
        );
      }

      // 2. Analyze with AI
      const analysis = await aiService.analyzeRepository({
        name: repository.name,
        description: repository.description,
        readme,
        fileStructure: fileTree.map((f: any) => f.path),
        recentCommits,
        sampleCode,
      });

      logger.info('AI analysis completed', {
        targetFile: analysis.targetFile,
        improvementType: analysis.improvementType,
      });

      // 3. Validate the change is meaningful
      const existingContent = await githubService.getFileContent(
        repository.owner,
        repository.name,
        analysis.targetFile,
        user.accessToken
      );

      const isValid = await aiService.validateChange(
        existingContent,
        analysis.newContent
      );

      if (!isValid) {
        logger.warn('AI suggested change is not meaningful enough, skipping');
        return;
      }

      // 4. Commit the change
      let commitResult;
      
      if (existingContent) {
        // Update existing file
        const fileData = await githubService.getRepositoryContent(
          repository.owner,
          repository.name,
          analysis.targetFile,
          user.accessToken
        );

        commitResult = await githubService.updateFile(
          repository.owner,
          repository.name,
          analysis.targetFile,
          analysis.newContent,
          analysis.commitMessage,
          fileData.sha,
          repository.defaultBranch,
          user.accessToken
        );
      } else {
        // Create new file
        commitResult = await githubService.createFile(
          repository.owner,
          repository.name,
          analysis.targetFile,
          analysis.newContent,
          analysis.commitMessage,
          repository.defaultBranch,
          user.accessToken
        );
      }

      // 5. Log the commit
      await CommitLog.create({
        repositoryId: repository._id,
        commitSha: commitResult.commit.sha,
        commitMessage: analysis.commitMessage,
        filesChanged: [analysis.targetFile],
        aiAnalysis: analysis.suggestion,
        status: 'success',
      });

      // 6. Update repository
      repository.lastAutomationRun = new Date();
      await repository.save();

      logger.info(`Successfully automated commit for ${repository.fullName}`, {
        commitSha: commitResult.commit.sha,
        file: analysis.targetFile,
      });

    } catch (error: any) {
      logger.error(`Error processing repository ${repository.fullName}:`, error.message);
      
      // Log failed attempt
      await CommitLog.create({
        repositoryId: repository._id,
        commitSha: '',
        commitMessage: 'Failed automation attempt',
        filesChanged: [],
        aiAnalysis: '',
        status: 'failed',
        errorMessage: error.message,
      });
    }
  }

  /**
   * Get README content
   */
  private async getReadmeContent(repository: any, accessToken: string): Promise<string> {
    const readmeFiles = ['README.md', 'readme.md', 'README.MD', 'Readme.md'];
    
    for (const filename of readmeFiles) {
      try {
        const content = await githubService.getFileContent(
          repository.owner,
          repository.name,
          filename,
          accessToken
        );
        if (content) return content;
      } catch (error) {
        // Try next filename
      }
    }
    
    return '';
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info('Scheduler stopped');
    }
  }
}

let schedulerInstance: SchedulerService | null = null;

export const initializeScheduler = () => {
  if (!schedulerInstance) {
    schedulerInstance = new SchedulerService();
    schedulerInstance.initialize();
  }
  return schedulerInstance;
};

export const getScheduler = () => schedulerInstance;
