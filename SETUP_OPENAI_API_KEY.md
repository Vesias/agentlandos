# GitHub Repository Secrets Setup Guide

## Setting up OPENAI_API_KEY for Automated Code Review Bots

The automated code review bots (cr-gpt and gemini-code-assist) require the `OPENAI_API_KEY` to be set in the repository secrets.

### Manual Setup (Recommended)

1. **Go to your GitHub repository**: https://github.com/Vesias/agentlandos

2. **Navigate to Settings**:
   - Click on "Settings" tab (top right of the repo)
   - In the left sidebar, click "Secrets and variables"
   - Click "Actions"

3. **Add New Repository Secret**:
   - Click "New repository secret"
   - Name: `OPENAI_API_KEY`
   - Secret value: `sk-proj-[YOUR_OPENAI_API_KEY]`
   - Click "Add secret"

### Alternative: GitHub CLI (requires authentication)

If you have GitHub CLI authenticated, you can run:

```bash
gh secret set OPENAI_API_KEY --body "[YOUR_OPENAI_API_KEY]"
```

### Verification

After setting up the secret:

1. Go to your repository's "Actions" tab
2. Look for any recent PR builds
3. Check if the cr-gpt bot warnings about missing OPENAI_API_KEY are resolved
4. New PRs should now have AI-powered code review comments

### Benefits

Once set up, you'll get:
- ✅ Automated code review comments from AI assistants
- ✅ Code quality suggestions and improvements
- ✅ Security vulnerability detection
- ✅ Best practice recommendations
- ✅ Performance optimization hints

### Security Note

The API key is securely encrypted in GitHub secrets and only accessible to authorized GitHub Actions workflows. It will not be visible in logs or to unauthorized users.

---

**Last Updated**: 6. Januar 2025  
**Status**: Ready for manual setup  
**Repository**: https://github.com/Vesias/agentlandos  
**Secret Name**: `OPENAI_API_KEY`