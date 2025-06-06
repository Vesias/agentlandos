#!/bin/bash
set -e

echo "🚀 Deploying AGENTLAND.SAARLAND to Production..."

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

# Check if deployment target is specified
if [ $# -eq 0 ]; then
    echo "Usage: $0 <deployment-target>"
    echo "Available targets:"
    echo "  - vercel    : Deploy frontend to Vercel"
    echo "  - railway   : Deploy to Railway"
    echo "  - docker    : Deploy using Docker Swarm"
    echo "  - k8s       : Deploy to Kubernetes"
    echo "  - vps       : Deploy to VPS with Docker Compose"
    exit 1
fi

# Validate required environment variables
REQUIRED_VARS=(DATABASE_URL REDIS_URL SECRET_KEY OPENAI_API_KEY DEEPSEEK_API_KEY)
for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        print_error "Environment variable $var is not set"
        exit 1
    fi
done

print_success "Environment variables validated"

DEPLOY_TARGET=$1

case $DEPLOY_TARGET in
    "vercel")
        print_status "Deploying frontend to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_error "Vercel CLI not found. Installing..."
            npm i -g vercel
        fi
        
        # Deploy frontend
        cd apps/web
        
        # Build production version
        print_status "Building production frontend..."
        pnpm build
        
        # Deploy to Vercel
        print_status "Deploying to Vercel..."
        vercel --prod
        
        print_success "Frontend deployed to Vercel!"
        ;;
        
    "railway")
        print_status "Deploying to Railway..."
        
        # Create railway.json if not exists
        if [ ! -f railway.json ]; then
            cat > railway.json << 'EOF'
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "on-failure",
    "restartPolicyMaxRetries": 10
  }
}
EOF
        fi
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            print_error "Railway CLI not found. Please install: https://docs.railway.app/develop/cli"
            exit 1
        fi
        
        print_status "Logging in to Railway..."
        railway login
        
        print_status "Deploying services..."
        railway up
        
        print_success "Deployed to Railway!"
        ;;
        
    "docker")
        print_status "Deploying with Docker Swarm..."
        
        # Initialize swarm if needed
        docker swarm init 2>/dev/null || true
        
        # Create production compose file
        cat > docker-compose.prod.yml << 'EOF'
version: '3.9'

services:
  postgres:
    image: pgvector/pgvector:pg16
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - agentland-network

  redis:
    image: redis:7-alpine
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
    volumes:
      - redis_data:/data
    networks:
      - agentland-network

  api:
    image: agentlandos-api:latest
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
      update_config:
        parallelism: 1
        delay: 10s
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    ports:
      - "8000:8000"
    networks:
      - agentland-network

  web:
    image: agentlandos-web:latest
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
      update_config:
        parallelism: 1
        delay: 10s
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    ports:
      - "80:3000"
    networks:
      - agentland-network

  nginx:
    image: nginx:alpine
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - agentland-network

networks:
  agentland-network:
    driver: overlay
    attachable: true

volumes:
  postgres_data:
  redis_data:
EOF
        
        # Build images
        print_status "Building production images..."
        docker-compose build --no-cache
        
        # Deploy stack
        print_status "Deploying stack..."
        docker stack deploy -c docker-compose.prod.yml agentland
        
        print_success "Deployed with Docker Swarm!"
        print_status "Check status with: docker stack ps agentland"
        ;;
        
    "k8s")
        print_status "Deploying to Kubernetes..."
        
        # Check if kubectl is available
        if ! command -v kubectl &> /dev/null; then
            print_error "kubectl not found. Please install kubectl first."
            exit 1
        fi
        
        # Create namespace
        kubectl create namespace agentland-saarland 2>/dev/null || true
        
        # Apply configurations
        print_status "Applying Kubernetes configurations..."
        kubectl apply -f infrastructure/k8s/ -n agentland-saarland
        
        print_success "Deployed to Kubernetes!"
        print_status "Check status with: kubectl get all -n agentland-saarland"
        ;;
        
    "vps")
        print_status "Deploying to VPS..."
        
        # Check for required environment variables
        if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ]; then
            print_error "Please set VPS_HOST and VPS_USER environment variables"
            exit 1
        fi
        
        # Create deployment package
        print_status "Creating deployment package..."
        tar -czf agentland-deploy.tar.gz \
            docker-compose.yml \
            apps/ \
            infrastructure/ \
            .env \
            launch.sh
        
        # Copy to VPS
        print_status "Copying files to VPS..."
        scp agentland-deploy.tar.gz $VPS_USER@$VPS_HOST:~/
        
        # Deploy on VPS
        print_status "Deploying on VPS..."
        ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
            set -e
            
            # Extract files
            tar -xzf agentland-deploy.tar.gz
            
            # Install Docker if needed
            if ! command -v docker &> /dev/null; then
                curl -fsSL https://get.docker.com | sh
                sudo usermod -aG docker $USER
            fi
            
            # Install Docker Compose if needed
            if ! command -v docker-compose &> /dev/null; then
                sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                sudo chmod +x /usr/local/bin/docker-compose
            fi
            
            # Deploy
            docker-compose pull
            docker-compose up -d
            
            echo "Deployment complete!"
ENDSSH
        
        # Cleanup
        rm agentland-deploy.tar.gz
        
        print_success "Deployed to VPS!"
        print_status "Access at: http://$VPS_HOST"
        ;;
        
    *)
        print_error "Unknown deployment target: $DEPLOY_TARGET"
        exit 1
        ;;
esac

print_success "Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "1. Configure DNS for your domain"
echo "2. Set up SSL certificates (Let's Encrypt recommended)"
echo "3. Configure monitoring (Prometheus/Grafana)"
echo "4. Set up backups for PostgreSQL"
echo "5. Configure CDN for static assets"