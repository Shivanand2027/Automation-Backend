# API Reference

Complete API documentation for the GitHub Automation Platform backend.

## Base URL

```
Development: http://localhost:3001
Production: https://api.yourdomain.com
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

## Endpoints

### Authentication

#### Initiate GitHub OAuth
```http
GET /api/auth/github
```

**Response:**
```json
{
  "url": "https://github.com/login/oauth/authorize?client_id=..."
}
```

**Usage:**
```javascript
const response = await fetch('http://localhost:3001/api/auth/github');
const { url } = await response.json();
window.location.href = url;
```

---

#### GitHub OAuth Callback
```http
GET /api/auth/github/callback?code={code}
```

**Query Parameters:**
- `code` (string, required) - Authorization code from GitHub

**Response:**
Redirects to frontend with JWT token in URL

---

#### Get Current User
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user_id",
  "username": "github_username",
  "email": "user@example.com",
  "avatarUrl": "https://avatars.githubusercontent.com/...",
  "githubId": "12345678"
}
```

**Example:**
```javascript
const response = await fetch('http://localhost:3001/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const user = await response.json();
```

---

#### Logout
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### Repositories

#### Get All User Repositories
```http
GET /api/repositories
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 123456,
    "name": "my-repo",
    "fullName": "username/my-repo",
    "description": "Repository description",
    "private": false,
    "owner": "username",
    "defaultBranch": "main",
    "updatedAt": "2025-01-01T00:00:00Z",
    "connected": false
  }
]
```

---

#### Get Connected Repositories
```http
GET /api/repositories/connected
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "mongodb_id",
    "userId": "user_id",
    "githubRepoId": 123456,
    "name": "my-repo",
    "fullName": "username/my-repo",
    "description": "Repository description",
    "owner": "username",
    "isPrivate": false,
    "defaultBranch": "main",
    "automationEnabled": true,
    "lastAutomationRun": "2025-01-01T00:00:00Z",
    "automationSchedule": "0 0 * * *",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

---

#### Connect Repository
```http
POST /api/repositories/connect
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "githubRepoId": 123456,
  "name": "my-repo",
  "fullName": "username/my-repo",
  "description": "Repository description",
  "owner": "username",
  "isPrivate": false,
  "defaultBranch": "main"
}
```

**Response:**
```json
{
  "_id": "mongodb_id",
  "userId": "user_id",
  "githubRepoId": 123456,
  "name": "my-repo",
  "fullName": "username/my-repo",
  "automationEnabled": false,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

**Example:**
```javascript
const response = await fetch('http://localhost:3001/api/repositories/connect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    githubRepoId: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    owner: repo.owner.login,
    isPrivate: repo.private,
    defaultBranch: repo.default_branch
  })
});
```

---

#### Get Repository Details
```http
GET /api/repositories/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string) - Repository MongoDB ID

**Response:**
```json
{
  "_id": "mongodb_id",
  "userId": "user_id",
  "githubRepoId": 123456,
  "name": "my-repo",
  "fullName": "username/my-repo",
  "description": "Repository description",
  "owner": "username",
  "isPrivate": false,
  "defaultBranch": "main",
  "automationEnabled": true,
  "lastAutomationRun": "2025-01-01T00:00:00Z",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

#### Get Repository Commit Logs
```http
GET /api/repositories/:id/commits
```

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string) - Repository MongoDB ID

**Response:**
```json
[
  {
    "_id": "log_id",
    "repositoryId": "repo_id",
    "commitSha": "abc123...",
    "commitMessage": "docs: improve README installation section",
    "filesChanged": ["README.md"],
    "aiAnalysis": "Added detailed installation instructions",
    "status": "success",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

---

#### Disconnect Repository
```http
DELETE /api/repositories/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string) - Repository MongoDB ID

**Response:**
```json
{
  "message": "Repository disconnected successfully"
}
```

---

### Automation

#### Enable Automation
```http
POST /api/automation/:id/enable
```

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string) - Repository MongoDB ID

**Response:**
```json
{
  "message": "Automation enabled successfully",
  "repository": {
    "_id": "repo_id",
    "automationEnabled": true
  }
}
```

**Example:**
```javascript
const response = await fetch(`http://localhost:3001/api/automation/${repoId}/enable`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

#### Disable Automation
```http
POST /api/automation/:id/disable
```

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string) - Repository MongoDB ID

**Response:**
```json
{
  "message": "Automation disabled successfully",
  "repository": {
    "_id": "repo_id",
    "automationEnabled": false
  }
}
```

---

#### Trigger Manual Automation
```http
POST /api/automation/:id/trigger
```

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string) - Repository MongoDB ID

**Response:**
```json
{
  "message": "Automation triggered successfully. Changes will be committed shortly."
}
```

**Note:** This endpoint triggers automation immediately without waiting for the scheduled time.

---

#### Get Automation Status
```http
GET /api/automation/:id/status
```

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string) - Repository MongoDB ID

**Response:**
```json
{
  "enabled": true,
  "lastRun": "2025-01-01T00:00:00Z",
  "schedule": "0 0 * * *"
}
```

---

#### Update Automation Schedule
```http
PUT /api/automation/:id/schedule
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
- `id` (string) - Repository MongoDB ID

**Request Body:**
```json
{
  "schedule": "0 2 * * *"
}
```

**Schedule Format:** Cron expression
- `0 0 * * *` - Daily at midnight
- `0 */6 * * *` - Every 6 hours
- `0 12 * * 1` - Every Monday at noon

**Response:**
```json
{
  "message": "Schedule updated successfully",
  "schedule": "0 2 * * *"
}
```

---

### Health Check

#### Check API Health
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

## Rate Limiting

Currently no rate limiting in development. Production should implement:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

## Webhooks (Future Feature)

Planned webhook support for:
- Automation completion
- Commit success/failure
- Repository updates

## Code Examples

### Complete Authentication Flow

```javascript
// 1. Initiate OAuth
async function login() {
  const response = await fetch('http://localhost:3001/api/auth/github');
  const { url } = await response.json();
  window.location.href = url;
}

// 2. Handle callback (in dashboard page)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
  localStorage.setItem('token', token);
}

// 3. Use token for API calls
async function fetchRepositories() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3001/api/repositories', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}
```

### Complete Repository Management

```javascript
// Connect repository
async function connectRepo(repo) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3001/api/repositories/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      githubRepoId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      owner: repo.owner.login,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch
    })
  });
  return await response.json();
}

// Enable automation
async function enableAutomation(repoId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3001/api/automation/${repoId}/enable`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}

// Get commit history
async function getCommitHistory(repoId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3001/api/repositories/${repoId}/commits`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}
```

## Testing with Postman/Insomnia

### Environment Variables
```json
{
  "base_url": "http://localhost:3001",
  "token": "your-jwt-token-here"
}
```

### Example Collection
Import this collection for testing:

```json
{
  "name": "GitHub Automation API",
  "requests": [
    {
      "name": "Get OAuth URL",
      "method": "GET",
      "url": "{{base_url}}/api/auth/github"
    },
    {
      "name": "Get Current User",
      "method": "GET",
      "url": "{{base_url}}/api/auth/me",
      "headers": {
        "Authorization": "Bearer {{token}}"
      }
    }
  ]
}
```

---

For more information, see the [main README](README.md) or open an issue on GitHub.
