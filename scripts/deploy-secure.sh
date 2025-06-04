#!/bin/bash

# AGENTLAND.SAARLAND - Secure Production Deployment Script
# Security-Commander Subagent Implementation
# 
# This script implements CRITICAL security hardening for production deployment
# Designed for 200,000 users with GDPR compliance

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(dirname "$(dirname "$(readlink -f "$0")")")"
ENV_FILE="$PROJECT_ROOT/.env.local"
BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"

echo -e "${BLUE}🔒 AGENTLAND.SAARLAND - SECURE DEPLOYMENT${NC}"
echo -e "${BLUE}Security-Commander Subagent - Production Hardening${NC}"
echo -e "${BLUE}=================================================${NC}"
echo

# Function to log with timestamp
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check if running as root (security requirement)
check_permissions() {
    log "Checking deployment permissions..."
    
    if [[ $EUID -eq 0 ]]; then
        error "This script should NOT be run as root for security reasons!"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        error "Docker is required but not installed"
        exit 1
    fi
    
    if ! command -v openssl &> /dev/null; then
        error "OpenSSL is required but not installed"
        exit 1
    fi
}

# Generate secure environment configuration
generate_secure_env() {
    log "Generating secure environment configuration..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup existing .env if it exists
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        warning "Backing up existing .env file..."
        cp "$PROJECT_ROOT/.env" "$BACKUP_DIR/.env.backup"
        
        # Check for exposed secrets
        if grep -q "sk-" "$PROJECT_ROOT/.env" 2>/dev/null; then
            error "CRITICAL: API keys found in .env file!"
            error "These keys may be compromised and should be revoked immediately!"
            echo
            grep "sk-\|_KEY=" "$PROJECT_ROOT/.env" || true
            echo
            read -p "Have you revoked these exposed keys? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                error "Please revoke exposed keys before continuing!"
                exit 1
            fi
        fi
    fi
    
    # Generate new secure credentials
    log "Generating cryptographically secure credentials..."
    
    SECRET_KEY=$(openssl rand -base64 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
    REDIS_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    BACKUP_ENCRYPTION_KEY=$(openssl rand -base64 32)
    
    # Create secure .env.local file
    cat > "$ENV_FILE" << EOF
# AGENTLAND.SAARLAND - SECURE PRODUCTION ENVIRONMENT
# Generated: $(date)
# Security Level: PRODUCTION
# 
# WARNING: This file contains sensitive credentials
# Never commit this file to version control!

# =============================================================================
# SECURITY SETTINGS - CRITICAL
# =============================================================================

# JWT Secret (32 bytes, base64 encoded)
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# =============================================================================
# DATABASE CONFIGURATION - SECURE
# =============================================================================

POSTGRES_SERVER=localhost
POSTGRES_USER=agentland_prod
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=agentland_saarland_prod
DATABASE_SSL=true

# =============================================================================
# REDIS CONFIGURATION - SECURE
# =============================================================================

REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# =============================================================================
# API KEYS - MANUALLY SET THESE
# =============================================================================

# DeepSeek API Key - Get from: https://platform.deepseek.com
DEEPSEEK_API_KEY=sk-PLEASE_SET_YOUR_REAL_DEEPSEEK_API_KEY

# Optional Provider Keys
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# External Service APIs
OPENWEATHER_API_KEY=
SAARVV_API_KEY=
SAARLAND_PORTAL_API_KEY=

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=100
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_MINUTES=15

# CORS - PRODUCTION DOMAINS ONLY
BACKEND_CORS_ORIGINS=["https://agentland.saarland","https://www.agentland.saarland"]

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================

# Environment
NODE_ENV=production
ENVIRONMENT=production

# Regional Settings
DEFAULT_LANGUAGE=de
SUPPORTED_LANGUAGES=["de","fr","en"]
SAARLAND_DIALECT_ENABLED=true

# AI Configuration
DEFAULT_AI_MODEL=deepseek-chat
DEEPSEEK_API_URL=https://api.deepseek.com/v1

# =============================================================================
# MONITORING & LOGGING
# =============================================================================

# Application Monitoring
LOG_LEVEL=INFO
ENABLE_ANALYTICS=true
ANALYTICS_RETENTION_DAYS=90

# =============================================================================
# GDPR COMPLIANCE
# =============================================================================

# Data Protection
DATA_ENCRYPTION_KEY=${ENCRYPTION_KEY}
BACKUP_ENCRYPTION_KEY=${BACKUP_ENCRYPTION_KEY}
GDPR_CONTACT_EMAIL=privacy@agentland.saarland
DATA_RETENTION_DAYS=365

# Cookie Settings
SECURE_COOKIES=true
SAME_SITE_COOKIES=strict

# Frontend URLs
NEXT_PUBLIC_API_URL=https://api.agentland.saarland
FRONTEND_URL=https://agentland.saarland
EOF

    # Set secure file permissions
    chmod 600 "$ENV_FILE"
    
    log "Secure environment file created: $ENV_FILE"
    warning "IMPORTANT: Set your real API keys in $ENV_FILE"
}

# Setup Docker security
configure_docker_security() {
    log "Configuring Docker security settings..."
    
    # Create secure docker-compose.override.yml
    cat > "$PROJECT_ROOT/docker-compose.override.yml" << EOF
# Security-hardened Docker Compose override
version: '3.9'

services:
  postgres:
    environment:
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256 --auth-local=scram-sha-256"
    ports:
      - "127.0.0.1:5432:5432"  # Bind to localhost only
    volumes:
      - postgres_data:/var/lib/postgresql/data:Z  # SELinux context
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/run/postgresql
    user: "999:999"  # postgres user
    
  redis:
    ports:
      - "127.0.0.1:6379:6379"  # Bind to localhost only
    command: redis-server --requirepass \${REDIS_PASSWORD} --maxmemory 256mb
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    user: "999:999"  # redis user
    
  api:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    environment:
      - PYTHONPATH=/app
      - PYTHONDONTWRITEBYTECODE=1
      - PYTHONUNBUFFERED=1
    
  web:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /app/.next/cache
EOF

    log "Docker security configuration applied"
}

# Setup firewall rules
configure_firewall() {
    log "Configuring firewall rules..."
    
    # Create firewall configuration script
    cat > "$PROJECT_ROOT/scripts/setup-firewall.sh" << 'EOF'
#!/bin/bash

# AGENTLAND.SAARLAND Firewall Configuration
# Only allow necessary ports for production

echo "Setting up firewall rules..."

# Reset iptables
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow SSH (change port if using non-standard)
iptables -A INPUT -p tcp --dport 22 -m limit --limit 5/min -j ACCEPT

# Allow HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Rate limiting for HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT

# Drop all other traffic
iptables -A INPUT -j LOG --log-prefix "DROPPED: "
iptables -A INPUT -j DROP

echo "Firewall rules applied"
EOF

    chmod +x "$PROJECT_ROOT/scripts/setup-firewall.sh"
    
    warning "Firewall script created. Run with sudo: sudo ./scripts/setup-firewall.sh"
}

# Setup SSL/TLS certificates
setup_ssl() {
    log "Setting up SSL/TLS configuration..."
    
    # Create SSL directory
    mkdir -p "$PROJECT_ROOT/ssl"
    
    # Generate self-signed certificate for development
    if [[ ! -f "$PROJECT_ROOT/ssl/agentland.crt" ]]; then
        log "Generating self-signed SSL certificate for development..."
        
        openssl req -x509 -newkey rsa:4096 -keyout "$PROJECT_ROOT/ssl/agentland.key" \
                    -out "$PROJECT_ROOT/ssl/agentland.crt" -days 365 -nodes \
                    -subj "/C=DE/ST=Saarland/L=Saarbruecken/O=AGENTLAND.SAARLAND/CN=localhost"
        
        chmod 600 "$PROJECT_ROOT/ssl/agentland.key"
        chmod 644 "$PROJECT_ROOT/ssl/agentland.crt"
        
        warning "Self-signed certificate generated for development"
        warning "For production, use Let's Encrypt or a proper CA certificate"
    fi
}

# Security audit
security_audit() {
    log "Performing security audit..."
    
    # Check for sensitive files
    echo "Checking for sensitive files..."
    
    # Check .env files
    if find "$PROJECT_ROOT" -name ".env" -not -path "*/node_modules/*" | grep -q .; then
        error "Found .env files that might contain secrets:"
        find "$PROJECT_ROOT" -name ".env" -not -path "*/node_modules/*"
        warning "Ensure these files are not committed to version control"
    fi
    
    # Check for hardcoded secrets
    echo "Scanning for hardcoded secrets..."
    SECRETS_FOUND=false
    
    if grep -r "sk-" "$PROJECT_ROOT" --include="*.py" --include="*.js" --include="*.ts" --exclude-dir=node_modules 2>/dev/null | grep -v "# TODO" | grep -v "YOUR_API_KEY" | head -5; then
        SECRETS_FOUND=true
    fi
    
    if grep -r "password.*=" "$PROJECT_ROOT" --include="*.py" --include="*.js" --include="*.ts" --exclude-dir=node_modules 2>/dev/null | grep -v "# TODO" | grep -v "YOUR_PASSWORD" | head -5; then
        SECRETS_FOUND=true
    fi
    
    if [[ "$SECRETS_FOUND" == "true" ]]; then
        error "Potential hardcoded secrets found!"
        warning "Review the above findings and remove any hardcoded credentials"
    else
        log "No obvious hardcoded secrets found"
    fi
    
    # Check file permissions
    echo "Checking critical file permissions..."
    
    if [[ -f "$ENV_FILE" ]]; then
        PERMS=$(stat -c "%a" "$ENV_FILE")
        if [[ "$PERMS" != "600" ]]; then
            warning "Environment file has permissive permissions: $PERMS"
            chmod 600 "$ENV_FILE"
            log "Fixed environment file permissions"
        fi
    fi
}

# Generate deployment checklist
generate_checklist() {
    log "Generating security deployment checklist..."
    
    cat > "$PROJECT_ROOT/DEPLOYMENT_SECURITY_CHECKLIST.md" << EOF
# 🔒 AGENTLAND.SAARLAND - Security Deployment Checklist

Generated: $(date)
Environment: Production
Target Users: 200,000

## ✅ Pre-Deployment Security Checklist

### CRITICAL - Must Complete Before Production
- [ ] **Revoke all exposed API keys** from previous .env files
- [ ] **Set real API keys** in .env.local (DEEPSEEK_API_KEY, etc.)
- [ ] **Change default database passwords** 
- [ ] **Generate new JWT secret keys**
- [ ] **Configure production domain** in CORS settings
- [ ] **Setup SSL/TLS certificates** (Let's Encrypt recommended)
- [ ] **Configure firewall rules** (run setup-firewall.sh)
- [ ] **Enable database encryption** at rest and in transit
- [ ] **Setup backup encryption** with separate keys

### HIGH PRIORITY - Complete Within 24h
- [ ] **Implement rate limiting** (Redis-based)
- [ ] **Setup monitoring** (Sentry, Prometheus)
- [ ] **Configure log aggregation** (ELK stack)
- [ ] **Enable security headers** (HSTS, CSP, etc.)
- [ ] **Setup intrusion detection** (fail2ban)
- [ ] **Configure automated backups** with encryption
- [ ] **Test disaster recovery** procedures
- [ ] **Implement GDPR compliance** controls

### MEDIUM PRIORITY - Complete Within 1 Week  
- [ ] **Security penetration testing**
- [ ] **Code security audit** (third-party)
- [ ] **Vulnerability scanning** (automated)
- [ ] **Compliance audit** (GDPR, ISO 27001)
- [ ] **Staff security training**
- [ ] **Incident response plan**
- [ ] **Security documentation** update

## 🎯 Production Security Targets

### Performance & Availability
- **Uptime Target**: 99.9%
- **Response Time**: < 200ms median
- **Rate Limit**: 100 req/min per user
- **Concurrent Users**: 10,000+

### Security Metrics
- **Failed Login Rate**: < 1%
- **Blocked Requests**: < 0.1%
- **Security Incidents**: 0 per month
- **Vulnerability Window**: < 24h to patch

### GDPR Compliance
- **Data Breach Response**: < 72h notification
- **Data Subject Requests**: < 30 days response
- **Data Retention**: Automated after 365 days
- **Consent Management**: Granular controls

## 🚨 Security Incident Response

### Immediate Actions (< 1 hour)
1. **Isolate affected systems**
2. **Revoke compromised credentials**
3. **Enable additional monitoring**
4. **Notify security team**

### Short-term Actions (< 24 hours)
1. **Assess impact and scope**
2. **Implement containment measures**
3. **Preserve evidence**
4. **Notify authorities if required**

### Recovery Actions (< 72 hours)
1. **Implement fixes**
2. **Restore from secure backups**
3. **Update security measures**
4. **Post-incident review**

## 📞 Emergency Contacts

- **Security Team**: security@agentland.saarland
- **System Admin**: admin@agentland.saarland  
- **GDPR Officer**: privacy@agentland.saarland
- **Legal Counsel**: legal@agentland.saarland

## 🔍 Security Monitoring

### Key Metrics to Monitor
- Authentication failures
- Rate limit violations
- Unusual traffic patterns
- Database access anomalies
- SSL/TLS certificate expiry
- Dependency vulnerabilities

### Automated Alerts
- Failed login threshold (5 attempts)
- High error rate (> 5%)
- Unusual geographic access
- Large data exports
- System resource exhaustion

---

**Generated by Security-Commander Subagent**  
**GODMODE CLAUDE System Security Implementation**
EOF

    log "Security checklist generated: DEPLOYMENT_SECURITY_CHECKLIST.md"
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting secure deployment process...${NC}"
    
    # Check prerequisites
    check_permissions
    
    # Security hardening steps
    generate_secure_env
    configure_docker_security
    configure_firewall
    setup_ssl
    
    # Security audit
    security_audit
    
    # Generate documentation
    generate_checklist
    
    echo
    log "✅ Secure deployment configuration completed!"
    echo
    warning "⚠️  CRITICAL NEXT STEPS:"
    echo -e "${YELLOW}1. Edit $ENV_FILE and set your real API keys${NC}"
    echo -e "${YELLOW}2. Review and run: sudo ./scripts/setup-firewall.sh${NC}"
    echo -e "${YELLOW}3. Setup proper SSL certificates for production${NC}"
    echo -e "${YELLOW}4. Complete the security checklist in DEPLOYMENT_SECURITY_CHECKLIST.md${NC}"
    echo
    echo -e "${GREEN}🔒 Security-Commander deployment process completed${NC}"
    echo -e "${GREEN}📋 Review DEPLOYMENT_SECURITY_CHECKLIST.md for next steps${NC}"
}

# Run main function
main "$@"