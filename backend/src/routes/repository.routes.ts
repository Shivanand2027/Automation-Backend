import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { Repository } from '../models/Repository.model';
import { User } from '../models/User.model';
import { CommitLog } from '../models/CommitLog.model';
import { githubService } from '../services/github.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Get user's GitHub repositories
 * GET /api/repositories
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const githubRepos = await githubService.getUserRepositories(user.accessToken);

    // Get connected repositories from database
    const connectedRepos = await Repository.find({ userId: user._id });
    const connectedRepoIds = new Set(connectedRepos.map(r => r.githubRepoId));

    // Merge data
    const repositories = githubRepos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      owner: repo.owner.login,
      defaultBranch: repo.default_branch,
      updatedAt: repo.updated_at,
      connected: connectedRepoIds.has(repo.id),
    }));

    res.json(repositories);
  } catch (error: any) {
    logger.error('Error fetching repositories:', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

/**
 * Get connected repositories
 * GET /api/repositories/connected
 */
router.get('/connected', authenticate, async (req: AuthRequest, res) => {
  try {
    const repositories = await Repository.find({ userId: req.user._id })
      .sort({ updatedAt: -1 });

    res.json(repositories);
  } catch (error: any) {
    logger.error('Error fetching connected repositories:', error.message);
    res.status(500).json({ error: 'Failed to fetch connected repositories' });
  }
});

/**
 * Connect a repository
 * POST /api/repositories/connect
 */
router.post('/connect', authenticate, async (req: AuthRequest, res) => {
  try {
    const { githubRepoId, name, fullName, description, owner, isPrivate, defaultBranch } = req.body;

    if (!githubRepoId || !name || !fullName || !owner) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already connected
    const existing = await Repository.findOne({
      userId: req.user._id,
      githubRepoId,
    });

    if (existing) {
      return res.status(400).json({ error: 'Repository already connected' });
    }

    // Create repository record
    const repository = await Repository.create({
      userId: req.user._id,
      githubRepoId,
      name,
      fullName,
      description: description || '',
      owner,
      isPrivate: isPrivate || false,
      defaultBranch: defaultBranch || 'main',
      automationEnabled: false,
    });

    logger.info(`Repository connected: ${fullName} by user ${req.user.username}`);

    res.status(201).json(repository);
  } catch (error: any) {
    logger.error('Error connecting repository:', error.message);
    res.status(500).json({ error: 'Failed to connect repository' });
  }
});

/**
 * Disconnect a repository
 * DELETE /api/repositories/:id
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    await Repository.deleteOne({ _id: req.params.id });
    await CommitLog.deleteMany({ repositoryId: req.params.id });

    logger.info(`Repository disconnected: ${repository.fullName}`);

    res.json({ message: 'Repository disconnected successfully' });
  } catch (error: any) {
    logger.error('Error disconnecting repository:', error.message);
    res.status(500).json({ error: 'Failed to disconnect repository' });
  }
});

/**
 * Get repository details
 * GET /api/repositories/:id
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    res.json(repository);
  } catch (error: any) {
    logger.error('Error fetching repository:', error.message);
    res.status(500).json({ error: 'Failed to fetch repository' });
  }
});

/**
 * Get repository commit logs
 * GET /api/repositories/:id/commits
 */
router.get('/:id/commits', authenticate, async (req: AuthRequest, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const commits = await CommitLog.find({ repositoryId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(commits);
  } catch (error: any) {
    logger.error('Error fetching commit logs:', error.message);
    res.status(500).json({ error: 'Failed to fetch commit logs' });
  }
});

export default router;
