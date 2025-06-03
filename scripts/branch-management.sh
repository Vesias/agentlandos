#!/bin/bash

# 🏛️ AGENTLAND.SAARLAND Branch Management Script
# Vereinfacht Branch-Operationen für optimalen Workflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}🏛️ AGENTLAND.SAARLAND Branch Management${NC}"
    echo -e "${PURPLE}===========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Nicht in einem Git Repository!"
        exit 1
    fi
}

# Show current status
show_status() {
    print_header
    echo -e "${YELLOW}📊 Aktueller Status:${NC}"
    echo "Branch: $(git branch --show-current)"
    echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'Kein Remote konfiguriert')"
    echo ""
    
    echo -e "${YELLOW}🌿 Lokale Branches:${NC}"
    git branch -v
    echo ""
    
    echo -e "${YELLOW}🔄 Status:${NC}"
    git status --short
    echo ""
}

# Create and switch to feature branch
create_feature() {
    local feature_name="$1"
    
    if [ -z "$feature_name" ]; then
        print_error "Feature-Name erforderlich!"
        echo "Verwendung: $0 feature <name>"
        exit 1
    fi
    
    print_info "Erstelle Feature Branch: feature/$feature_name"
    
    # Switch to develop and pull latest
    git checkout develop
    git pull origin develop 2>/dev/null || print_warning "Konnte nicht von origin pullen"
    
    # Create and switch to feature branch
    git checkout -b "feature/$feature_name"
    
    print_success "Feature Branch 'feature/$feature_name' erstellt und ausgecheckt"
    print_info "Entwickle dein Feature und committe regelmäßig!"
}

# Create and switch to hotfix branch
create_hotfix() {
    local hotfix_name="$1"
    
    if [ -z "$hotfix_name" ]; then
        print_error "Hotfix-Name erforderlich!"
        echo "Verwendung: $0 hotfix <name>"
        exit 1
    fi
    
    print_info "Erstelle Hotfix Branch: hotfix/$hotfix_name"
    
    # Switch to main and pull latest
    git checkout main
    git pull origin main 2>/dev/null || print_warning "Konnte nicht von origin pullen"
    
    # Create and switch to hotfix branch
    git checkout -b "hotfix/$hotfix_name"
    
    print_success "Hotfix Branch 'hotfix/$hotfix_name' erstellt und ausgecheckt"
    print_warning "Hotfix nur für kritische Bugs verwenden!"
}

# Create release branch
create_release() {
    local version="$1"
    
    if [ -z "$version" ]; then
        print_error "Version erforderlich!"
        echo "Verwendung: $0 release <version>"
        echo "Beispiel: $0 release v2.1.0"
        exit 1
    fi
    
    print_info "Erstelle Release Branch: release/$version"
    
    # Switch to develop and pull latest
    git checkout develop
    git pull origin develop 2>/dev/null || print_warning "Konnte nicht von origin pullen"
    
    # Create and switch to release branch
    git checkout -b "release/$version"
    
    print_success "Release Branch 'release/$version' erstellt und ausgecheckt"
    print_info "Bereite Release vor: Version bumpen, letzte Fixes, etc."
}

# Finish feature (merge to develop)
finish_feature() {
    local current_branch=$(git branch --show-current)
    
    if [[ ! $current_branch == feature/* ]]; then
        print_error "Nicht auf einem Feature Branch! Aktuell: $current_branch"
        exit 1
    fi
    
    local feature_name=${current_branch#feature/}
    print_info "Schließe Feature ab: $feature_name"
    
    # Switch to develop and pull latest
    git checkout develop
    git pull origin develop 2>/dev/null || print_warning "Konnte nicht von origin pullen"
    
    # Merge feature branch (no fast-forward for history)
    git merge --no-ff "$current_branch"
    
    # Delete feature branch
    git branch -d "$current_branch"
    
    print_success "Feature '$feature_name' in develop gemerged und Branch gelöscht"
    print_info "Erstelle nun einen Pull Request für develop → main"
}

# Finish hotfix (merge to main and develop)
finish_hotfix() {
    local current_branch=$(git branch --show-current)
    
    if [[ ! $current_branch == hotfix/* ]]; then
        print_error "Nicht auf einem Hotfix Branch! Aktuell: $current_branch"
        exit 1
    fi
    
    local hotfix_name=${current_branch#hotfix/}
    print_info "Schließe Hotfix ab: $hotfix_name"
    
    # Merge to main
    git checkout main
    git pull origin main 2>/dev/null || print_warning "Konnte nicht von main pullen"
    git merge --no-ff "$current_branch"
    
    # Merge to develop
    git checkout develop
    git pull origin develop 2>/dev/null || print_warning "Konnte nicht von develop pullen"
    git merge --no-ff "$current_branch"
    
    # Delete hotfix branch
    git branch -d "$current_branch"
    
    # Return to develop
    git checkout develop
    
    print_success "Hotfix '$hotfix_name' in main und develop gemerged"
    print_warning "Vergiss nicht zu pushen: git push origin main && git push origin develop"
}

# Finish release (merge to main and develop, create tag)
finish_release() {
    local current_branch=$(git branch --show-current)
    
    if [[ ! $current_branch == release/* ]]; then
        print_error "Nicht auf einem Release Branch! Aktuell: $current_branch"
        exit 1
    fi
    
    local version=${current_branch#release/}
    print_info "Schließe Release ab: $version"
    
    # Merge to main
    git checkout main
    git pull origin main 2>/dev/null || print_warning "Konnte nicht von main pullen"
    git merge --no-ff "$current_branch"
    
    # Create tag
    git tag -a "$version" -m "🚀 RELEASE: $version"
    
    # Merge to develop
    git checkout develop
    git pull origin develop 2>/dev/null || print_warning "Konnte nicht von develop pullen"
    git merge --no-ff "$current_branch"
    
    # Delete release branch
    git branch -d "$current_branch"
    
    # Return to develop
    git checkout develop
    
    print_success "Release '$version' abgeschlossen und Tag erstellt"
    print_warning "Vergiss nicht zu pushen: git push origin main && git push origin develop && git push origin --tags"
}

# Clean up merged branches
cleanup_branches() {
    print_info "Räume gemergte Branches auf..."
    
    # Show branches that can be deleted
    echo -e "${YELLOW}🧹 Branches die gelöscht werden können:${NC}"
    git branch --merged develop | grep -E "(feature/|hotfix/|release/)" || echo "Keine zu löschenden Branches gefunden"
    
    read -p "Möchtest du diese Branches löschen? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch --merged develop | grep -E "(feature/|hotfix/|release/)" | xargs -r git branch -d
        print_success "Branches aufgeräumt!"
    else
        print_info "Branches beibehalten"
    fi
}

# Show help
show_help() {
    print_header
    echo -e "${YELLOW}📋 Verfügbare Kommandos:${NC}"
    echo ""
    echo -e "${GREEN}Status & Übersicht:${NC}"
    echo "  $0 status                    - Zeige aktuellen Git-Status"
    echo "  $0 branches                  - Zeige alle Branches"
    echo ""
    echo -e "${GREEN}Branch erstellen:${NC}"
    echo "  $0 feature <name>            - Erstelle Feature Branch"
    echo "  $0 hotfix <name>             - Erstelle Hotfix Branch"
    echo "  $0 release <version>         - Erstelle Release Branch"
    echo ""
    echo -e "${GREEN}Branch abschließen:${NC}"
    echo "  $0 finish-feature            - Feature in develop mergen"
    echo "  $0 finish-hotfix             - Hotfix in main+develop mergen"
    echo "  $0 finish-release            - Release abschließen mit Tag"
    echo ""
    echo -e "${GREEN}Maintenance:${NC}"
    echo "  $0 cleanup                   - Gemergte Branches löschen"
    echo "  $0 sync                      - Alle Branches mit Remote sync"
    echo ""
    echo -e "${BLUE}Beispiele:${NC}"
    echo "  $0 feature saarland-tourism-agent"
    echo "  $0 hotfix critical-plz-bug"
    echo "  $0 release v2.1.0"
}

# Sync with remote
sync_branches() {
    print_info "Synchronisiere mit Remote..."
    
    # Fetch latest changes
    git fetch origin
    
    # Update main
    git checkout main
    git pull origin main 2>/dev/null || print_warning "Konnte main nicht pullen"
    
    # Update develop
    git checkout develop
    git pull origin develop 2>/dev/null || print_warning "Konnte develop nicht pullen"
    
    print_success "Branches synchronisiert!"
}

# Main script logic
check_git_repo

case "${1:-help}" in
    "status")
        show_status
        ;;
    "branches")
        git branch -a
        ;;
    "feature")
        create_feature "$2"
        ;;
    "hotfix")
        create_hotfix "$2"
        ;;
    "release")
        create_release "$2"
        ;;
    "finish-feature")
        finish_feature
        ;;
    "finish-hotfix")
        finish_hotfix
        ;;
    "finish-release")
        finish_release
        ;;
    "cleanup")
        cleanup_branches
        ;;
    "sync")
        sync_branches
        ;;
    "help"|*)
        show_help
        ;;
esac