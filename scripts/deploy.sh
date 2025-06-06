#!/bin/bash
set -e

echo "🚀 Starting AGENTLAND.SAARLAND Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed!"
    exit 1
fi

print_success "Prerequisites check passed"

# Validate required environment variables
REQUIRED_VARS=(DATABASE_URL REDIS_URL SECRET_KEY OPENAI_API_KEY DEEPSEEK_API_KEY)
for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        print_error "Environment variable $var is not set"
        exit 1
    fi
done

print_success "Environment variables validated"

# Build containers
print_status "Building Docker containers..."
docker-compose build

# Start services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check health
print_status "Checking service health..."

# Check API health
API_HEALTH=$(curl -s http://localhost:8000/api/health || echo "failed")
if [[ $API_HEALTH == *"healthy"* ]]; then
    print_success "API is healthy"
else
    print_error "API health check failed"
    docker-compose logs api
fi

# Check web health
WEB_HEALTH=$(curl -s http://localhost:3000 || echo "failed")
if [[ $WEB_HEALTH == *"html"* ]]; then
    print_success "Web app is healthy"
else
    print_error "Web app health check failed"
    docker-compose logs web
fi

# Show running containers
print_status "Running containers:"
docker-compose ps

print_success "Deployment complete!"
echo ""
echo "🌐 Access the application at:"
echo "   - Web: http://localhost:3000"
echo "   - API: http://localhost:8000/api/docs"
echo ""
echo "📊 Monitor logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"