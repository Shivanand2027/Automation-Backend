# Deployment Guide

This guide covers deploying the AI-Powered GitHub Automation Platform to production.

## Prerequisites

- Node.js 18+
- MongoDB (Atlas or self-hosted)
- Domain name (optional)
- GitHub OAuth app (production URLs)
- Google Gemini API key

## Deployment Options

### Option 1: Cloud Platform (Recommended)

#### Frontend (Vercel)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your repository
   - Configure:
     - Framework: Next.js
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Environment Variables:
       - `NEXT_PUBLIC_API_URL`: Your backend URL

3. **Set up custom domain** (optional)

#### Backend (Railway/Render/Heroku)

**Using Railway:**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize**
   ```bash
   railway login
   railway init
   ```

3. **Configure environment variables**
   - Go to Railway dashboard
   - Add all variables from `.env`

4. **Deploy**
   ```bash
   railway up
   ```

**Using Render:**

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables

#### Database (MongoDB Atlas)

1. **Create cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster

2. **Configure network access**
   - Allow access from anywhere (0.0.0.0/0)
   - Or specific IPs

3. **Get connection string**
   - Replace in production `.env`

### Option 2: VPS Deployment

#### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MongoDB (optional)
sudo apt install -y mongodb

# Install Nginx
sudo apt install -y nginx
```

#### Application Setup

```bash
# Clone repository
git clone https://github.com/your-repo/github-automation-platform.git
cd github-automation-platform

# Install dependencies
npm run install:all

# Build projects
npm run build

# Set up environment variables
nano .env
# Add your production values

# Start with PM2
pm2 start backend/dist/index.js --name "github-automation-api"
pm2 startup
pm2 save
```

#### Nginx Configuration

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Environment Variables (Production)

### Backend

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
GITHUB_CALLBACK_URL=https://api.yourdomain.com/api/auth/github/callback

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/github-automation

# JWT
JWT_SECRET=generate_new_secure_secret_for_production

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Scheduling
AUTOMATION_CRON_SCHEDULE=0 0 * * *
```

### Frontend

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## GitHub OAuth Configuration (Production)

1. Go to GitHub Developer Settings
2. Create new OAuth app or update existing:
   - Homepage URL: `https://yourdomain.com`
   - Callback URL: `https://api.yourdomain.com/api/auth/github/callback`
3. Update environment variables

## Post-Deployment Checklist

- [ ] Update GitHub OAuth callback URLs
- [ ] Verify all environment variables
- [ ] Test authentication flow
- [ ] Test repository connection
- [ ] Test automation trigger
- [ ] Check logs for errors
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test SSL certificate
- [ ] Set up domain DNS
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up error tracking (Sentry)

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart on crash
pm2 startup
```

### Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/health

# Response should be:
# {"status":"ok","timestamp":"..."}
```

## Backup Strategy

### MongoDB Backup

```bash
# Manual backup
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Automated daily backup (cron)
0 2 * * * mongodump --uri="mongodb+srv://..." --out=/backup/$(date +\%Y\%m\%d)
```

### Application Backup

```bash
# Backup configuration
tar -czf config-backup.tar.gz .env backend/.env frontend/.env.local
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Multiple backend instances
- Shared Redis for sessions
- CDN for static assets

### Database Scaling
- MongoDB replica set
- Read replicas
- Sharding for large datasets

### Caching
- Redis for API responses
- CDN for frontend assets
- Database query caching

## Troubleshooting

### Common Issues

**502 Bad Gateway**
- Check if backend is running: `pm2 status`
- Check logs: `pm2 logs`
- Verify Nginx configuration

**Database Connection Error**
- Verify MongoDB URI
- Check network access in Atlas
- Test connection: `mongosh "mongodb+srv://..."`

**OAuth Callback Error**
- Verify callback URL matches GitHub app
- Check frontend URL in backend env
- Verify SSL is working

**Automation Not Running**
- Check cron schedule format
- Verify scheduler initialized
- Check logs for errors

## Security Hardening

```bash
# Firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm run install:all

# Rebuild
npm run build

# Restart
pm2 restart all
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update
npm update

# Audit security
npm audit
npm audit fix
```

## Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Check GitHub issues
4. Contact support

---

**Note:** Always test deployments in a staging environment first!
