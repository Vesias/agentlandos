#!/bin/bash
set -e

echo "🔍 Starting Bug Hunt for AGENTLAND.SAARLAND..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ISSUES_FOUND=0

# Function to check for issues
check_issue() {
    local description=$1
    local command=$2
    local expected=$3
    
    echo -n "Checking: $description... "
    
    result=$(eval $command 2>&1 || echo "FAILED")
    
    if [[ $result == *"$expected"* ]] || [[ -z "$expected" && $result != "FAILED" ]]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "  ${YELLOW}Issue: $result${NC}"
        ((ISSUES_FOUND++))
    fi
}

# Check for environment variables
echo -e "\n${YELLOW}=== Environment Variables ===${NC}"
check_issue "ENV file exists" "test -f .env && echo 'exists'" "exists"
check_issue "DEEPSEEK_API_KEY is set" "grep -q 'DEEPSEEK_API_KEY=' .env && echo 'set'" "set"
check_issue "Database credentials" "grep -q 'POSTGRES_PASSWORD=' .env && echo 'set'" "set"

# Check Python dependencies
echo -e "\n${YELLOW}=== Python Dependencies ===${NC}"
check_issue "API requirements.txt exists" "test -f apps/api/requirements.txt && echo 'exists'" "exists"
check_issue "Python version" "python3 --version" "Python 3"

# Check Node dependencies
echo -e "\n${YELLOW}=== Node Dependencies ===${NC}"
check_issue "Node modules installed" "test -d apps/web/node_modules && echo 'installed'" "installed"
check_issue "Package.json valid" "cd apps/web && node -e 'require(\"./package.json\")' && echo 'valid'" "valid"

# Check for common code issues
echo -e "\n${YELLOW}=== Code Issues ===${NC}"
check_issue "No console.log in production" "! grep -r 'console.log' apps/web/src --include='*.tsx' --include='*.ts' | grep -v '// ' && echo 'clean'" "clean"
check_issue "No exposed API keys" "! grep -r 'sk-[a-zA-Z0-9]' apps/ --include='*.py' --include='*.ts' --include='*.tsx' --exclude-dir='node_modules' | grep -v '.env' && echo 'clean'" "clean"
check_issue "TypeScript errors" "cd apps/web && pnpm run typecheck 2>&1 | grep -q 'Found 0 errors' && echo 'clean'" "clean"

# Check Docker setup
echo -e "\n${YELLOW}=== Docker Configuration ===${NC}"
check_issue "Docker Compose file" "test -f docker-compose.yml && echo 'exists'" "exists"
check_issue "Dockerfile for API" "test -f apps/api/Dockerfile && echo 'exists'" "exists"
check_issue "Dockerfile for Web" "test -f apps/web/Dockerfile && echo 'exists'" "exists"

# Check API imports
echo -e "\n${YELLOW}=== API Imports ===${NC}"
check_issue "Database imports in main.py" "grep -q 'from app.db.database import' apps/api/app/main.py && echo 'found'" "found"
check_issue "Agent services exist" "test -d apps/api/app/services && echo 'exists'" "exists"
check_issue "Specialized agents exist" "test -f apps/api/app/agents/specialized/tourism_agent.py && echo 'exists'" "exists"

# Summary
echo -e "\n${YELLOW}=== Summary ===${NC}"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No issues found! The codebase looks healthy.${NC}"
else
    echo -e "${RED}❌ Found $ISSUES_FOUND issues that need attention.${NC}"
fi

echo -e "\n${YELLOW}=== Recommendations ===${NC}"
echo "1. Run 'pnpm install' to ensure all dependencies are installed"
echo "2. Check .env file and update API keys if needed"
echo "3. Run 'docker-compose build' before deployment"
echo "4. Test locally with 'pnpm dev' before deploying"