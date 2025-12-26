import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { Repository } from '../models/Repository.model';
import { User } from '../models/User.model';
import { PendingChange } from '../models/PendingChange.model';
import { aiAgentService } from '../services/aiAgent.service';
import { fileOperationService } from '../services/fileOperation.service';
import { githubService } from '../services/github.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Create AI modification plan
 * POST /api/agent/:repoId/plan
 */
router.post('/:repoId/plan', authenticate, async (req: AuthRequest, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const repository = await Repository.findOne({
      _id: req.params.repoId,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    logger.info(`AI Agent planning for: ${prompt.substring(0, 100)}`);

    // Fetch repository structure
    const fileTree = await fileOperationService.getFileTree(
      repository.owner,
      repository.name,
      repository.defaultBranch,
      user.accessToken
    );

    // Analyze repository
    const sampleFiles: { path: string; content: string }[] = [];
    
    // Get important files (README, package.json, etc.)
    const importantFiles = fileTree.filter((f: any) =>
      f.path.match(/^(README|package\.json|requirements\.txt|.*\.config\.(js|ts)|tsconfig\.json)$/i)
    );

    for (const file of importantFiles.slice(0, 5)) {
      try {
        const content = await fileOperationService.readFile(
          repository.owner,
          repository.name,
          file.path,
          user.accessToken
        );
        sampleFiles.push({ path: file.path, content });
      } catch (error) {
        // Skip if file can't be read
      }
    }

    const repositoryContext = await aiAgentService.analyzeRepository(
      fileTree,
      sampleFiles
    );

    repositoryContext.name = repository.name;
    repositoryContext.description = repository.description;

    // Fetch relevant files based on context
    const relevantFiles: { path: string; content: string }[] = [...sampleFiles];

    // Add code files based on main language
    const codeFiles = fileTree.filter((f: any) => {
      const ext = f.path.split('.').pop();
      return f.type === 'blob' && ext === repositoryContext.mainLanguage;
    });

    for (const file of codeFiles.slice(0, 10)) {
      if (!relevantFiles.find(f => f.path === file.path)) {
        try {
          const content = await fileOperationService.readFile(
            repository.owner,
            repository.name,
            file.path,
            user.accessToken
          );
          relevantFiles.push({ path: file.path, content });
        } catch (error) {
          // Skip if file can't be read
        }
      }
    }

    // Create modification plan
    const plan = await aiAgentService.createModificationPlan(
      prompt,
      repositoryContext,
      relevantFiles
    );

    // Save pending change
    const pendingChange = await PendingChange.create({
      workspaceSessionId: null,
      userId: req.user._id,
      repositoryId: req.params.repoId,
      aiPrompt: prompt,
      agentPlan: plan.plan,
      changes: plan.changes,
      commitMessage: plan.commitMessage,
      risk: plan.risk,
      explanation: plan.explanation,
      status: 'pending',
    });

    logger.info(`AI Agent created plan: ${pendingChange._id}`);

    res.json({
      pendingChange: {
        _id: pendingChange._id,
        aiPrompt: prompt,
        agentPlan: plan.plan,
        changes: plan.changes,
        commitMessage: plan.commitMessage,
        riskLevel: plan.risk,
        status: 'pending',
      },
    });
  } catch (error: any) {
    logger.error('Error creating AI plan:', error.message);
    res.status(500).json({
      message: 'Failed to create AI plan',
      error: error.message,
      details: error.stack,
    });
  }
});

/**
 * Approve and commit AI changes
 * POST /api/agent/:repoId/approve/:changeId
 */
router.post('/:repoId/approve/:changeId', authenticate, async (req: AuthRequest, res) => {
  try {
    const pendingChange = await PendingChange.findOne({
      _id: req.params.changeId,
      userId: req.user._id,
      repositoryId: req.params.repoId,
    });

    if (!pendingChange) {
      return res.status(404).json({ error: 'Pending change not found' });
    }

    if (pendingChange.status !== 'pending') {
      return res.status(400).json({ error: 'Change already processed' });
    }

    const repository = await Repository.findById(req.params.repoId);
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Apply changes to GitHub
    const committedFiles: string[] = [];
    let finalCommitSha = '';

    for (const change of pendingChange.changes) {
      try {
        let sha: string | undefined;

        if (change.action === 'update') {
          // Get current file SHA
          sha = await fileOperationService.getFileSha(
            repository.owner,
            repository.name,
            change.filePath,
            user.accessToken
          );
        }

        const result = await fileOperationService.writeFile(
          repository.owner,
          repository.name,
          change.filePath,
          change.modifiedContent,
          pendingChange.commitMessage,
          repository.defaultBranch,
          user.accessToken,
          sha
        );

        committedFiles.push(change.filePath);
        finalCommitSha = result.commit.sha;
      } catch (error: any) {
        logger.error(`Error applying change to ${change.filePath}:`, error.message);
      }
    }

    // Update pending change status
    pendingChange.status = 'committed';
    pendingChange.commitSha = finalCommitSha;
    await pendingChange.save();

    logger.info(`AI changes committed: ${pendingChange._id}`);

    res.json({
      success: true,
      commitSha: finalCommitSha,
      filesChanged: committedFiles,
      commitMessage: pendingChange.commitMessage,
    });
  } catch (error: any) {
    logger.error('Error approving changes:', error.message);
    res.status(500).json({ error: 'Failed to approve changes' });
  }
});

/**
 * Reject AI changes
 * POST /api/agent/:repoId/reject/:changeId
 */
router.post('/:repoId/reject/:changeId', authenticate, async (req: AuthRequest, res) => {
  try {
    const pendingChange = await PendingChange.findOne({
      _id: req.params.changeId,
      userId: req.user._id,
      repositoryId: req.params.repoId,
    });

    if (!pendingChange) {
      return res.status(404).json({ error: 'Pending change not found' });
    }

    pendingChange.status = 'rejected';
    await pendingChange.save();

    logger.info(`AI changes rejected: ${pendingChange._id}`);

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error rejecting changes:', error.message);
    res.status(500).json({ error: 'Failed to reject changes' });
  }
});

/**
 * Get pending changes for repository
 * GET /api/agent/:repoId/pending
 */
router.get('/:repoId/pending', authenticate, async (req: AuthRequest, res) => {
  try {
    const pendingChanges = await PendingChange.find({
      userId: req.user._id,
      repositoryId: req.params.repoId,
      status: 'pending',
    }).sort({ createdAt: -1 });

    res.json(pendingChanges);
  } catch (error: any) {
    logger.error('Error fetching pending changes:', error.message);
    res.status(500).json({ error: 'Failed to fetch pending changes' });
  }
});

export default router;
