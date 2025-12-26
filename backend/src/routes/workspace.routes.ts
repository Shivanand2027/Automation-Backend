import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { Repository } from '../models/Repository.model';
import { User } from '../models/User.model';
import { WorkspaceSession } from '../models/WorkspaceSession.model';
import { fileOperationService } from '../services/fileOperation.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Get repository file tree
 * GET /api/workspace/:repoId/tree
 */
router.get('/:repoId/tree', authenticate, async (req: AuthRequest, res) => {
  try {
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

    const fileTree = await fileOperationService.getFileTree(
      repository.owner,
      repository.name,
      repository.defaultBranch,
      user.accessToken
    );

    const hierarchicalTree = fileOperationService.buildFileTree(fileTree);

    logger.info(`File tree fetched for ${repository.fullName}`);

    res.json({
      tree: hierarchicalTree,
      flatTree: fileTree,
      fileCount: fileTree.length,
      branch: repository.defaultBranch,
    });
  } catch (error: any) {
    logger.error('Error fetching file tree:', error.message);
    res.status(500).json({ message: 'Failed to fetch file tree', error: error.message });
  }
});

/**
 * Read file content
 * GET /api/workspace/:repoId/file/*
 */
router.get('/:repoId/file/*', authenticate, async (req: AuthRequest, res) => {
  try {
    const filePath = req.params[0];
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
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

    const content = await fileOperationService.readFile(
      repository.owner,
      repository.name,
      filePath,
      user.accessToken
    );

    const language = fileOperationService.detectLanguage(filePath);

    logger.info(`File read: ${filePath} from ${repository.fullName}`);

    res.json({
      path: filePath,
      content,
      language,
    });
  } catch (error: any) {
    logger.error('Error reading file:', error.message);
    res.status(500).json({ message: 'Failed to read file', error: error.message });
  }
});

/**
 * Write file content
 * PUT /api/workspace/:repoId/file/*
 */
router.put('/:repoId/file/*', authenticate, async (req: AuthRequest, res) => {
  try {
    const filePath = req.params[0];
    const { content, message, sha } = req.body;

    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'File path and content are required' });
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

    const commitMessage = message || `Update ${filePath}`;

    const result = await fileOperationService.writeFile(
      repository.owner,
      repository.name,
      filePath,
      content,
      commitMessage,
      repository.defaultBranch,
      user.accessToken,
      sha
    );

    logger.info(`File written: ${filePath} to ${repository.fullName}`);

    res.json({
      success: true,
      commitSha: result.commit.sha,
      message: commitMessage,
    });
  } catch (error: any) {
    logger.error('Error writing file:', error.message);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

/**
 * Get or create workspace session
 * GET /api/workspace/:repoId/session
 */
router.get('/:repoId/session', authenticate, async (req: AuthRequest, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.repoId,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    let session = await WorkspaceSession.findOne({
      userId: req.user._id,
      repositoryId: req.params.repoId,
    });

    if (!session) {
      session = await WorkspaceSession.create({
        userId: req.user._id,
        repositoryId: req.params.repoId,
        currentBranch: repository.defaultBranch,
        openFiles: [],
      });
    } else {
      session.lastActivity = new Date();
      await session.save();
    }

    res.json(session);
  } catch (error: any) {
    logger.error('Error managing workspace session:', error.message);
    res.status(500).json({ error: 'Failed to manage workspace session' });
  }
});

/**
 * Update workspace session (save open files)
 * PUT /api/workspace/:repoId/session
 */
router.put('/:repoId/session', authenticate, async (req: AuthRequest, res) => {
  try {
    const { openFiles } = req.body;

    const session = await WorkspaceSession.findOne({
      userId: req.user._id,
      repositoryId: req.params.repoId,
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.openFiles = openFiles;
    session.lastActivity = new Date();
    await session.save();

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error updating workspace session:', error.message);
    res.status(500).json({ error: 'Failed to update workspace session' });
  }
});

export default router;
