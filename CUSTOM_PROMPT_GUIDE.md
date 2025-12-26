# Custom AI Prompt Feature - User Guide

## 🎯 Overview

The Custom AI Prompt feature allows you to give specific instructions to the AI, which will then analyze your **entire repository** and make the necessary changes to fulfill your request.

## 🚀 How to Use

### 1. Navigate to Your Repository
- Go to the dashboard and select a repository
- You'll see a **"🤖 Custom AI Prompt"** button

### 2. Open the Custom Prompt Modal
- Click the **"🤖 Custom AI Prompt"** button
- A modal will appear with a text area for your instruction

### 3. Enter Your Instruction
Write a clear description of what you want the AI to create or modify. Be specific!

**Good Examples:**
```
✅ "Create a calculator in HTML with CSS styling and JavaScript functionality"
✅ "Add comprehensive JSDoc comments to all JavaScript files"
✅ "Create a contact form with email validation"
✅ "Improve the README with installation instructions and usage examples"
✅ "Add error handling to all API calls in the services folder"
✅ "Create a navigation bar component in React with responsive design"
```

**Bad Examples:**
```
❌ "Make it better" (too vague)
❌ "Fix bugs" (need to specify what bugs)
❌ "Update code" (need to specify what to update)
```

### 4. Execute the Prompt
- Click **"✨ Execute Prompt"**
- The AI will:
  1. Analyze ALL files in your repository
  2. Understand your instruction
  3. Determine which files need to be created or updated
  4. Generate complete, working code
  5. Commit the changes to your repository

### 5. View Results
- A success message will show the summary and files changed
- The changes will be committed to your repository's main branch
- You'll see the commit in the Automation History section

## 💡 What Can You Create?

### Web Development
```
"Create a responsive landing page with hero section"
"Add a dark mode toggle to the website"
"Create a CSS animation for the hero section"
"Build a pricing table component"
```

### Documentation
```
"Add API documentation for all endpoints"
"Create a comprehensive README with examples"
"Add inline comments explaining complex algorithms"
"Generate a CONTRIBUTING.md file"
```

### Features
```
"Add form validation to all input fields"
"Create a search functionality for the blog"
"Add pagination to the product list"
"Implement lazy loading for images"
```

### Code Quality
```
"Add error handling to all async functions"
"Refactor duplicate code into reusable functions"
"Add TypeScript type definitions"
"Improve code comments and documentation"
```

### Testing
```
"Create unit tests for all utility functions"
"Add integration tests for the API endpoints"
"Create a test setup file"
```

## 🔍 How It Works Behind the Scenes

1. **Repository Analysis**
   - Fetches ALL files from your repository
   - Reads content of all files (up to 100KB each)
   - Analyzes file structure and relationships

2. **AI Processing**
   - Sends your prompt + entire repository context to AI
   - AI understands your requirement
   - Determines what changes are needed
   - Generates complete file contents

3. **Change Execution**
   - Creates new files if needed
   - Updates existing files with new content
   - Commits all changes with a meaningful message
   - Logs the automation in your history

## ⚙️ API Endpoint

**Endpoint:** `POST /api/automation/:id/custom-prompt`

**Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "Your instruction here"
}
```

**Response:**
```json
{
  "message": "Custom prompt executed successfully",
  "summary": "Created calculator.html with HTML, CSS, and JavaScript",
  "commitMessage": "feat: Add interactive calculator",
  "filesChanged": ["calculator.html"],
  "commitShas": ["abc123..."]
}
```

## 📊 Best Practices

### ✅ DO:
- Be specific about what you want
- Mention file types if relevant (HTML, CSS, React, etc.)
- Specify where files should be created
- Include styling/design requirements
- Mention any libraries or frameworks to use

### ❌ DON'T:
- Give vague instructions
- Ask for too many unrelated things at once
- Use extremely long prompts (keep it under 500 words)
- Expect it to fix every bug automatically
- Request harmful or malicious code

## 🎯 Example Use Cases

### Use Case 1: Creating a New Feature
**Prompt:** 
```
"Create a todo list application with HTML, CSS, and JavaScript. 
Include add, delete, and mark as complete functionality. 
Style it with a modern, clean design."
```

**Result:** AI creates `todo.html`, `todo.css`, `todo.js` with complete implementation

### Use Case 2: Improving Documentation
**Prompt:**
```
"Add JSDoc comments to all functions in the src/utils folder. 
Include parameter descriptions, return types, and usage examples."
```

**Result:** AI updates all files in `src/utils` with comprehensive JSDoc comments

### Use Case 3: Adding Tests
**Prompt:**
```
"Create Jest unit tests for all functions in utils.js. 
Include edge cases and error scenarios."
```

**Result:** AI creates `utils.test.js` with complete test suite

## 🔒 Limitations

- Files larger than 100KB are skipped during analysis
- Very large repositories might hit API limits
- Complex architectural changes might need multiple prompts
- Cannot access external APIs or databases
- Cannot install npm packages (yet - future feature!)

## 🆘 Troubleshooting

**Issue:** "Failed to execute custom prompt"
- **Solution:** Check if your repository has accessible files
- Make sure the prompt is clear and specific
- Try a simpler prompt first

**Issue:** Changes not appearing
- **Solution:** Refresh the page or check GitHub directly
- Verify automation is enabled for the repository
- Check the commit logs for errors

**Issue:** AI created wrong files
- **Solution:** Be more specific in your prompt
- Mention exact file paths and names
- Provide more context about the project structure

## 🚀 Future Enhancements

Coming soon:
- Preview changes before committing
- Approve/reject specific file changes
- Batch multiple prompts
- Integration with npm/pip for package installation
- Support for pull requests instead of direct commits

## 💬 Tips for Better Results

1. **Be Specific:** Instead of "add a button", say "add a blue submit button with rounded corners"
2. **Include Context:** Mention existing files or structure
3. **One Task at a Time:** Focus on one feature per prompt
4. **Iterate:** Start simple, then refine with additional prompts
5. **Check Results:** Review the changes and provide feedback for next time

---

**Need Help?** Check the commit logs in Automation History to see what the AI created!
