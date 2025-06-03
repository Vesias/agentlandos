#!/bin/bash
set -e

echo "🚀 Deploying Enhanced AGENTLAND.SAARLAND with Sub-Agents..."
echo "============================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning "No .env file found. Creating from example..."
    cat > .env << EOF
# AGENTLAND.SAARLAND Environment Configuration
# ============================================

# API Keys
DEEPSEEK_API_KEY=your-deepseek-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Database
DATABASE_URL=postgresql+asyncpg://agentland:saarland2024@postgres:5432/agentland_saarland
POSTGRES_USER=agentland
POSTGRES_PASSWORD=saarland2024
POSTGRES_DB=agentland_saarland

# Redis
REDIS_URL=redis://redis:6379

# Security
SECRET_KEY=your-secret-key-change-in-production-$(openssl rand -hex 32)

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
EOF
    print_warning "Please update the .env file with your actual API keys!"
fi

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed! Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed! Please install Docker Compose first."
    exit 1
fi

print_success "Prerequisites check passed"

# Step 2: Stop existing services
print_status "Stopping existing services..."
docker-compose down 2>/dev/null || true

# Step 3: Build containers
print_status "Building Docker containers with enhanced features..."
docker-compose build --no-cache

# Step 4: Start services
print_status "Starting enhanced services..."
docker-compose up -d

# Step 5: Wait for services to be ready
print_status "Waiting for services to initialize..."
sleep 15

# Step 6: Check health
print_status "Checking service health..."

# Check API health
API_HEALTH=$(curl -s http://localhost:8000/api/health || echo "failed")
if [[ $API_HEALTH == *"healthy"* ]]; then
    print_success "API is healthy"
else
    print_error "API health check failed"
    docker-compose logs api
fi

# Check enhanced agents endpoint
AGENT_CAPS=$(curl -s http://localhost:8000/api/v1/enhanced-agents/capabilities || echo "failed")
if [[ $AGENT_CAPS == *"EnhancedNavigatorAgent"* ]]; then
    print_success "Enhanced Agent System is operational"
else
    print_warning "Enhanced Agent System may not be fully initialized"
fi

# Check web health
WEB_HEALTH=$(curl -s http://localhost:3000 || echo "failed")
if [[ $WEB_HEALTH == *"html"* ]]; then
    print_success "Web app is healthy"
else
    print_error "Web app health check failed"
    docker-compose logs web
fi

# Step 7: Display status
print_status "Deployment Summary:"
echo ""
docker-compose ps
echo ""

# Step 8: Run quick test
print_status "Running quick functionality test..."
echo ""

# Test simple query
echo "Testing simple query..."
curl -s -X POST http://localhost:8000/api/v1/enhanced-agents/query \
  -H "Content-Type: application/json" \
  -d '{"message": "Hallo", "language": "de"}' | jq '.message' 2>/dev/null || echo "Simple query test failed"

echo ""

# Step 9: Display access information
print_success "Enhanced AGENTLAND.SAARLAND deployment complete!"
echo ""
echo "🌐 Access Points:"
echo "   - Web Interface: http://localhost:3000"
echo "   - API Documentation: http://localhost:8000/api/docs"
echo "   - Enhanced Agents API: http://localhost:8000/api/v1/enhanced-agents"
echo "   - Database Admin: http://localhost:8080 (user: agentland, password: saarland2024)"
echo ""
echo "📊 Monitoring:"
echo "   - Logs: docker-compose logs -f"
echo "   - Status: docker-compose ps"
echo "   - Stop: docker-compose down"
echo ""
echo "🧪 Test Enhanced Features:"
echo "   - Run full test suite: python test_enhanced_agents.py"
echo "   - Check capabilities: curl http://localhost:8000/api/v1/enhanced-agents/capabilities | jq"
echo ""
echo "🚀 The enhanced agent system with sub-agents is now running!"
echo "   - Complex queries will be automatically decomposed"
echo "   - Multiple subtasks execute in parallel"
echo "   - Results are intelligently aggregated"
echo ""

# Optional: Run comprehensive test
read -p "Would you like to run the comprehensive test suite? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Running comprehensive tests..."
    python test_enhanced_agents.py
fi