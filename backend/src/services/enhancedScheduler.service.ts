import cron from 'node-cron';
import { Repository } from '../models/Repository.model';
import { User } from '../models/User.model';
import { CommitLog } from '../models/CommitLog.model';
import { githubService } from './github.service';
import { aiService } from './ai.service';
import { logger } from '../utils/logger';
import { generateDailyCronExpression } from '../utils/schedule.util';

interface ScheduledJob {
  repositoryId: string;
  task: cron.ScheduledTask;
}

export class EnhancedSchedulerService {
  private scheduledJobs: Map<string, ScheduledJob> = new Map();
  private masterCheckJob: cron.ScheduledTask | null = null;

  /**
   * Initialize the enhanced scheduler
   */
  async initialize() {
    logger.info('Initializing enhanced scheduler with per-repository scheduling');

    // Load all enabled repositories and schedule them
    await this.scheduleAllRepositories();

    // Master check job runs every hour to catch any missed schedules
    this.masterCheckJob = cron.schedule('0 * * * *', async () => {
      logger.info('Running master scheduler check');
      await this.checkMissedSchedules();
    });

    logger.info('Enhanced scheduler initialized successfully');
  }

  /**
   * Schedule all enabled repositories
   */
  async scheduleAllRepositories() {
    try {
      const repositories = await Repository.find({
        automationEnabled: true,
      });

      logger.info(`Found ${repositories.length} repositories with automation enabled`);

      for (const repo of repositories) {
        this.scheduleRepository(repo);
      }
    } catch (error: any) {
      logger.error('Error scheduling repositories:', error.message);
    }
  }

  /**
   * Schedule a specific repository
   */
  scheduleRepository(repository: any) {
    const repoId = repository._id.toString();

    // Remove existing schedule if any
    this.unscheduleRepository(repoId);

    if (!repository.automationEnabled) {
      logger.info(`Automation disabled for ${repository.fullName}, skipping schedule`);
      return;
    }

    try {
      // Generate cron expression from scheduled time
      const cronExpression = generateDailyCronExpression(repository.scheduledTime || '00:00');
      
      logger.info(`Scheduling ${repository.fullName} with cron: ${cronExpression} (${repository.scheduledTime} ${repository.timezone})`);

      const task = cron.schedule(cronExpression, async () => {
        logger.info(`Triggered scheduled automation for ${repository.fullName}`);
        await this.processRepository(repository._id);
      }, {
        timezone: repository.timezone || 'UTC',
      });

      this.scheduledJobs.set(repoId, {
        repositoryId: repoId,
        task,
      });

      logger.info(`Successfully scheduled ${repository.fullName}`);
    } catch (error: any) {
      logger.error(`Error scheduling repository ${repository.fullName}:`, error.message);
    }
  }

  /**
   * Unschedule a repository
   */
  unscheduleRepository(repositoryId: string) {
    const job = this.scheduledJobs.get(repositoryId);
    if (job) {
      job.task.stop();
      this.scheduledJobs.delete(repositoryId);
      logger.info(`Unscheduled repository: ${repositoryId}`);
    }
  }

  /**
   * Update schedule for a repository
   */
  async updateRepositorySchedule(repositoryId: string) {
    try {
      const repository = await Repository.findById(repositoryId);
      if (repository) {
        this.scheduleRepository(repository);
        logger.info(`Updated schedule for repository: ${repository.fullName}`);
      }
    } catch (error: any) {
      logger.error(`Error updating repository schedule:`, error.message);
    }
  }

  /**
   * Check for missed schedules (repositories that should have run but didn't)
   */
  async checkMissedSchedules() {
    try {
      const repositories = await Repository.find({
        automationEnabled: true,
      });

      for (const repo of repositories) {
        const repoId = repo._id.toString();
        
        // Check if repository is scheduled
        if (!this.scheduledJobs.has(repoId)) {
          logger.warn(`Repository ${repo.fullName} is enabled but not scheduled, rescheduling...`);
          this.scheduleRepository(repo);
        }
      }
    } catch (error: any) {
      logger.error('Error checking missed schedules:', error.message);
    }
  }

  /**
   * Run automation for all enabled repositories (manual trigger)
   */
  async runAutomation() {
    try {
      const repositories = await Repository.find({
        automationEnabled: true,
      }).populate('userId');

      logger.info(`Manually running automation for ${repositories.length} repositories`);

      for (const repo of repositories) {
        try {
          await this.processRepository(repo._id);
        } catch (error: any) {
          logger.error(`Error processing repository ${repo.fullName}:`, error.message);
        }
      }
    } catch (error: any) {
      logger.error('Error in manual automation run:', error.message);
    }
  }

  /**
   * Process a single repository
   */
  async processRepository(repositoryId: any) {
    const repository = await Repository.findById(repositoryId).populate('userId');
    
    if (!repository) {
      logger.error(`Repository not found: ${repositoryId}`);
      return;
    }

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

      // Get ALL code files (not just a sample)
      const codeFiles = fileTree.filter((file: any) => 
        file.type === 'blob' && 
        (file.path.endsWith('.js') || 
         file.path.endsWith('.ts') || 
         file.path.endsWith('.py') ||
         file.path.endsWith('.java') ||
         file.path.endsWith('.html') ||
         file.path.endsWith('.css') ||
         file.path.endsWith('.jsx') ||
         file.path.endsWith('.tsx'))
      );

      // Collect multiple sample files for better context
      let sampleCode = '';
      const samplesToCollect = Math.min(3, codeFiles.length);
      for (let i = 0; i < samplesToCollect; i++) {
        const randomCodeFile = codeFiles[Math.floor(Math.random() * codeFiles.length)];
        try {
          const content = await githubService.getFileContent(
            repository.owner,
            repository.name,
            randomCodeFile.path,
            user.accessToken
          );
          sampleCode += `\n\n--- File: ${randomCodeFile.path} ---\n${content.substring(0, 1000)}`;
        } catch (error) {
          // Skip if file cannot be read
        }
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
   * Get scheduled jobs info
   */
  getScheduledJobsInfo() {
    const jobs: any[] = [];
    this.scheduledJobs.forEach((job, repoId) => {
      jobs.push({
        repositoryId: repoId,
        isRunning: job.task ? true : false,
      });
    });
    return jobs;
  }

  /**
   * Stop the scheduler
   */
  stop() {
    // Stop all repository-specific jobs
    this.scheduledJobs.forEach((job) => {
      job.task.stop();
    });
    this.scheduledJobs.clear();

    // Stop master check job
    if (this.masterCheckJob) {
      this.masterCheckJob.stop();
      logger.info('Enhanced scheduler stopped');
    }
  }
}

let enhancedSchedulerInstance: EnhancedSchedulerService | null = null;

export const initializeEnhancedScheduler = async () => {
  if (!enhancedSchedulerInstance) {
    enhancedSchedulerInstance = new EnhancedSchedulerService();
    await enhancedSchedulerInstance.initialize();
  }
  return enhancedSchedulerInstance;
};

export const getEnhancedScheduler = () => enhancedSchedulerInstance;
