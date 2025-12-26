# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please email us instead of using the issue tracker.

## Security Best Practices

### For Developers

1. **Never commit sensitive data:**
   - API keys
   - OAuth secrets
   - JWT secrets
   - Database credentials

2. **Use environment variables:**
   - Store all secrets in `.env`
   - Never commit `.env` to version control
   - Use `.env.example` for documentation

3. **Keep dependencies updated:**
   ```bash
   npm audit
   npm audit fix
   ```

4. **Validate all inputs:**
   - Use express-validator
   - Sanitize user input
   - Implement rate limiting

5. **Secure authentication:**
   - Use HTTPS in production
   - Implement token expiration
   - Rotate secrets regularly

### For Users

1. **Protect your access tokens:**
   - Never share your GitHub tokens
   - Revoke unused OAuth apps
   - Use fine-grained tokens when possible

2. **Review permissions:**
   - Grant minimal required scopes
   - Regularly audit connected apps
   - Monitor repository activity

3. **Keep software updated:**
   - Update Node.js regularly
   - Update dependencies
   - Apply security patches

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

- ✅ GitHub OAuth 2.0
- ✅ JWT authentication
- ✅ Environment variable protection
- ✅ Input validation
- ✅ Error handling
- ✅ Secure token storage
- ✅ CORS configuration
- ✅ Rate limiting (recommended)

## Recommendations for Production

1. **Enable HTTPS:**
   - Use SSL certificates
   - Redirect HTTP to HTTPS
   - Enable HSTS

2. **Implement rate limiting:**
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   
   app.use('/api/', limiter);
   ```

3. **Use helmet.js:**
   ```typescript
   import helmet from 'helmet';
   app.use(helmet());
   ```

4. **Set up monitoring:**
   - Log security events
   - Monitor API usage
   - Alert on suspicious activity

5. **Regular audits:**
   - Review access logs
   - Check for vulnerabilities
   - Update dependencies
