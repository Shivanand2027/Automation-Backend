import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { githubService } from '../services/github.service';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Initiate GitHub OAuth flow
 * GET /api/auth/github
 */
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const scope = 'repo user:email';

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  res.redirect(githubAuthUrl);
});

/**
 * GitHub OAuth callback
 * GET /api/auth/github/callback
 */
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const accessToken = await githubService.getAccessToken(code as string);

    // Get user info
    const githubUser = await githubService.getUserInfo(accessToken);

    // Create or update user
    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (user) {
      user.accessToken = accessToken;
      user.username = githubUser.login;
      user.email = githubUser.email || '';
      user.avatarUrl = githubUser.avatar_url;
      await user.save();
    } else {
      user = await User.create({
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email || '',
        avatarUrl: githubUser.avatar_url,
        accessToken,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, githubId: user.githubId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    logger.info(`User authenticated: ${user.username}`);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  } catch (error: any) {
    logger.error('OAuth callback error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

/**
 * Get current user
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await User.findById(decoded.userId).select('-accessToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      githubId: user.githubId,
    });
  } catch (error: any) {
    logger.error('Get user error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * Logout
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
