import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { Repository } from '../models/Repository.model';
import { User } from '../models/User.model';
import { CommitLog } from '../models/CommitLog.model';
import { getScheduler } from '../services/scheduler.service';
import { getEnhancedScheduler } from '../services/enhancedScheduler.service';
import { generateDailyCronExpression, parseTime, isValidTimezone, getNextScheduledRun } from '../utils/schedule.util';
import { githubService } from '../services/github.service';
import { aiService } from '../services/ai.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Enable automation for a repository
 * POST /api/automation/:id/enable
 */
router.post('/:id/enable', authenticate, async (req: AuthRequest, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    repository.automationEnabled = true;
    await repository.save();

    // Schedule with enhanced scheduler
    const enhancedScheduler = getEnhancedScheduler();
    if (enhancedScheduler) {
      enhancedScheduler.scheduleRepository(repository);
    }

    logger.info(`Automation enabled for repository: ${repository.fullName}`);

    res.json({
      message: 'Automation enabled successfully',
      repository,
    });
  } catch (error: any) {
    logger.error('Error enabling automation:', error.message);
    res.status(500).json({ error: 'Failed to enable automation' });
  }
});

/**
 * Disable automation for a repository
 * POST /api/automation/:id/disable
 */
router.post('/:id/disable', authenticate, async (req: AuthRequest, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    repository.automationEnabled = false;
    await repository.save();

    // Unschedule with enhanced scheduler
    const enhancedScheduler = getEnhancedScheduler();
    if (enhancedScheduler) {
      enhancedScheduler.unscheduleRepository(repository._id.toString());
    }

    logger.info(`Automation disabled for repository: ${repository.fullName}`);

    res.json({
      message: 'Automation disabled successfully',
      repository,
    });
  } catch (error: any) {
    logger.error('Error disabling automation:', error.message);
    res.status(500).json({ error: 'Failed to disable automation' });
  }
});

/**
 * Manually trigger automation for a repository
 * POST /api/automation/:id/trigger
 */
router.post('/:id/trigger', authenticate, async (req: AuthRequest, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Try enhanced scheduler first, fallback to regular scheduler
    const enhancedScheduler = getEnhancedScheduler();
    const scheduler = getScheduler();
    
    if (enhancedScheduler) {
      // Run automation asynchronously with enhanced scheduler
      enhancedScheduler.processRepository(repository._id).catch((error) => {
        logger.error('Error in manual automation trigger:', error.message);
      });
    } else if (scheduler) {
      // Fallback to regular scheduler
      scheduler.processRepository(repository).catch((error) => {
        logger.error('Error in manual automation trigger:', error.message);
      });
    } else {
      return res.status(500).json({ error: 'Scheduler not initialized' });
    }

    logger.info(`Manual automation triggered for repository: ${repository.fullName}`);

    res.json({
      message: 'Automation triggered successfully. Changes will be committed shortly.',
    });
  } catch (error: any) {
    logger.error('Error triggering automation:', error.message);
    res.status(500).json({ error: 'Failed to trigger automation' });
  }
});

/**
 * Get automation status for a repository
 * GET /api/automation/:id/status
 */
router.get('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    res.json({
      enabled: repository.automationEnabled,
      lastRun: repository.lastAutomationRun,
      schedule: repository.automationSchedule,
    });
  } catch (error: any) {
    logger.error('Error fetching automation status:', error.message);
    res.status(500).json({ error: 'Failed to fetch automation status' });
  }
});

/**
 * Update automation schedule
 * PUT /api/automation/:id/schedule
 */
router.put('/:id/schedule', authenticate, async (req: AuthRequest, res) => {
  try {
    const { schedule } = req.body;

    if (!schedule) {
      return res.status(400).json({ error: 'Schedule is required' });
    }

    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    repository.automationSchedule = schedule;
    await repository.save();

    logger.info(`Automation schedule updated for repository: ${repository.fullName}`);

    res.json({
      message: 'Schedule updated successfully',
      schedule: repository.automationSchedule,
    });
  } catch (error: any) {
    logger.error('Error updating schedule:', error.message);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

/**
 * Set daily schedule time for a repository
 * PUT /api/automation/:id/daily-schedule
 */
router.put('/:id/daily-schedule', authenticate, async (req: AuthRequest, res) => {
  try {
    const { scheduledTime, timezone } = req.body;

    if (!scheduledTime) {
      return res.status(400).json({ error: 'Scheduled time is required (format: HH:MM)' });
    }

    // Validate time format
    try {
      parseTime(scheduledTime);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    // Validate timezone if provided
    if (timezone && !isValidTimezone(timezone)) {
      return res.status(400).json({ error: 'Invalid timezone' });
    }

    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Update repository schedule
    repository.scheduledTime = scheduledTime;
    if (timezone) {
      repository.timezone = timezone;
    }
    
    // Generate and update cron expression
    const cronExpression = generateDailyCronExpression(scheduledTime);
    repository.automationSchedule = cronExpression;
    
    await repository.save();

    // Update scheduler
    const enhancedScheduler = getEnhancedScheduler();
    if (enhancedScheduler && repository.automationEnabled) {
      await enhancedScheduler.updateRepositorySchedule(repository._id.toString());
    }

    const nextRun = getNextScheduledRun(scheduledTime, timezone || 'UTC');

    logger.info(`Daily schedule updated for repository: ${repository.fullName} - ${scheduledTime} ${timezone || 'UTC'}`);

    res.json({
      message: 'Daily schedule updated successfully',
      scheduledTime: repository.scheduledTime,
      timezone: repository.timezone,
      cronExpression: repository.automationSchedule,
      nextRun: nextRun.toISOString(),
    });
  } catch (error: any) {
    logger.error('Error updating daily schedule:', error.message);
    res.status(500).json({ error: 'Failed to update daily schedule' });
  }
});

/**
 * Execute custom AI prompt on repository
 * POST /api/automation/:id/custom-prompt
 */
router.post('/:id/custom-prompt', authenticate, async (req: AuthRequest, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    logger.info(`Custom prompt received for ${repository.fullName}: ${prompt.substring(0, 100)}`);

    // Fetch ALL files from repository
    const fileTree = await githubService.getRepositoryTree(
      repository.owner,
      repository.name,
      repository.defaultBranch,
      user.accessToken
    );

    // Get content of ALL files (limit to reasonable size files)
    const allFiles = [];
    for (const file of fileTree) {
      if (file.type === 'blob' && file.size < 100000) { // Skip files larger than 100KB
        try {
          const content = await githubService.getFileContent(
            repository.owner,
            repository.name,
            file.path,
            user.accessToken
          );
          allFiles.push({ path: file.path, content });
        } catch (error) {
          logger.warn(`Could not read file ${file.path}`);
        }
      }
    }

    // Get README
    let readme = '';
    try {
      readme = await githubService.getFileContent(
        repository.owner,
        repository.name,
        'README.md',
        user.accessToken
      );
    } catch (error) {
      // README might not exist
    }

    // Process with AI
    const aiResult = await aiService.processCustomPrompt(prompt, {
      name: repository.name,
      description: repository.description,
      readme,
      fileStructure: fileTree,
      allFiles,
    });

    // Execute the changes
    const committedFiles: string[] = [];
    const commitShas: string[] = [];

    for (const change of aiResult.changes) {
      try {
        if (change.action === 'create') {
          const result = await githubService.createFile(
            repository.owner,
            repository.name,
            change.filePath,
            change.content,
            aiResult.commitMessage,
            repository.defaultBranch,
            user.accessToken
          );
          committedFiles.push(change.filePath);
          commitShas.push(result.commit.sha);
        } else if (change.action === 'update') {
          // Get current file SHA
          const fileData = await githubService.getRepositoryContent(
            repository.owner,
            repository.name,
            change.filePath,
            user.accessToken
          );

          const result = await githubService.updateFile(
            repository.owner,
            repository.name,
            change.filePath,
            change.content,
            aiResult.commitMessage,
            fileData.sha,
            repository.defaultBranch,
            user.accessToken
          );
          committedFiles.push(change.filePath);
          commitShas.push(result.commit.sha);
        }
        // Note: delete action can be added if needed
      } catch (error: any) {
        logger.error(`Error applying change to ${change.filePath}:`, error.message);
      }
    }

    // Log the changes
    await CommitLog.create({
      repositoryId: repository._id,
      commitSha: commitShas[0] || '',
      commitMessage: aiResult.commitMessage,
      filesChanged: committedFiles,
      aiAnalysis: `Custom prompt: ${prompt}\n\nSummary: ${aiResult.summary}`,
      status: 'success',
    });

    repository.lastAutomationRun = new Date();
    await repository.save();

    logger.info(`Custom prompt executed successfully for ${repository.fullName}`);

    res.json({
      message: 'Custom prompt executed successfully',
      summary: aiResult.summary,
      commitMessage: aiResult.commitMessage,
      filesChanged: committedFiles,
      commitShas,
    });
  } catch (error: any) {
    logger.error('Error executing custom prompt:', error.message);
    res.status(500).json({ 
      error: 'Failed to execute custom prompt',
      details: error.message 
    });
  }
});

export default router;
