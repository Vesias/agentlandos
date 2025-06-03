#!/bin/bash

# 🏛️ AGENTLAND.SAARLAND Git Setup Script
# Konfiguriert Git für optimalen Workflow

set -e

echo "🏛️ AGENTLAND.SAARLAND Git-Konfiguration startet..."

# Git Hooks Setup
echo "📝 Setze Git Commit Message Template..."
git config commit.template .gitmessage

# Branch Protection Setup
echo "🔒 Konfiguriere Branch Protection..."
git config branch.main.pushRemote origin
git config branch.develop.pushRemote origin

# Merge Strategy
echo "🔀 Konfiguriere Merge-Strategie..."
git config pull.rebase true
git config merge.ff false
git config merge.tool vimdiff

# Commit Message Validation
echo "✅ Erstelle Commit Message Hook..."
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

# Commit Message Validation für AGENTLAND.SAARLAND
commit_regex='^(✨|🐛|💡|🔧|📚|🧪|🔒|⚡|🎨|🚀|📦|🏗️|🤖|📍|🏛️) [A-Z][A-Z]*:'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Commit Message Format Fehler!"
    echo "Format: <emoji> <TYPE>: <description>"
    echo ""
    echo "Verfügbare Typen:"
    echo "✨ FEAT: Neues Feature"
    echo "🐛 FIX: Bugfix"
    echo "💡 UPDATE: Verbesserung"
    echo "🔧 REFACTOR: Refactoring"
    echo "📚 DOCS: Dokumentation"
    echo "🧪 TEST: Tests"
    echo "🔒 SECURITY: Sicherheit"
    echo "⚡ PERF: Performance"
    echo "🎨 STYLE: Styling"
    echo "🚀 DEPLOY: Deployment"
    echo "📦 DEPS: Dependencies"
    echo "🏗️ BUILD: Build-System"
    echo "🤖 AI: KI/Agent Updates"
    echo "📍 DATA: Daten-Updates"
    echo "🏛️ ADMIN: Administrative Änderungen"
    echo ""
    echo "Beispiel: ✨ FEAT: Saarland PLZ-Finder implementiert"
    exit 1
fi

# Check message length
if [ $(head -n1 "$1" | wc -c) -gt 72 ]; then
    echo "❌ Commit Message zu lang! Maximum 72 Zeichen für erste Zeile."
    exit 1
fi

echo "✅ Commit Message Format korrekt!"
EOF

chmod +x .git/hooks/commit-msg

# Pre-Commit Hook für Code Quality
echo "🔍 Erstelle Pre-Commit Hook..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 Pre-Commit Checks für AGENTLAND.SAARLAND..."

# TypeScript Type Check
if [ -f "apps/web/tsconfig.json" ]; then
    echo "📝 TypeScript Type Check..."
    cd apps/web && npm run typecheck
    if [ $? -ne 0 ]; then
        echo "❌ TypeScript Fehler gefunden!"
        exit 1
    fi
    cd ../..
fi

# Linting
if [ -f "package.json" ]; then
    echo "🧹 ESLint Check..."
    npm run lint
    if [ $? -ne 0 ]; then
        echo "❌ Linting Fehler gefunden!"
        exit 1
    fi
fi

# Formatierung prüfen
echo "🎨 Prettier Format Check..."
npm run format -- --check
if [ $? -ne 0 ]; then
    echo "❌ Code nicht korrekt formatiert!"
    echo "💡 Führe 'npm run format' aus um zu korrigieren."
    exit 1
fi

echo "✅ Alle Pre-Commit Checks bestanden!"
EOF

chmod +x .git/hooks/pre-commit

# Create initial branches if they don't exist
echo "🌿 Erstelle Standard-Branches..."

# Create develop branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/develop; then
    git checkout -b develop
    git checkout main
    echo "✅ Develop Branch erstellt"
fi

# Git Aliases für besseren Workflow
echo "⚡ Setze Git Aliases..."
git config alias.co checkout
git config alias.br branch
git config alias.ci commit
git config alias.st status
git config alias.unstage 'reset HEAD --'
git config alias.last 'log -1 HEAD'
git config alias.visual '!gitk'
git config alias.graph 'log --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset" --abbrev-commit'
git config alias.feature 'checkout -b feature/'
git config alias.hotfix 'checkout -b hotfix/'
git config alias.release 'checkout -b release/'

# Workflow Aliases
git config alias.start-feature '!f() { git checkout develop && git pull && git checkout -b feature/$1; }; f'
git config alias.finish-feature '!f() { git checkout develop && git merge --no-ff feature/$1 && git branch -d feature/$1; }; f'
git config alias.start-hotfix '!f() { git checkout main && git pull && git checkout -b hotfix/$1; }; f'
git config alias.finish-hotfix '!f() { git checkout main && git merge --no-ff hotfix/$1 && git checkout develop && git merge --no-ff hotfix/$1 && git branch -d hotfix/$1; }; f'

echo ""
echo "🎉 Git-Konfiguration für AGENTLAND.SAARLAND abgeschlossen!"
echo ""
echo "📋 Verfügbare Git Aliases:"
echo "   git start-feature <name>  - Neues Feature beginnen"
echo "   git finish-feature <name> - Feature abschließen"
echo "   git start-hotfix <name>   - Hotfix beginnen"
echo "   git finish-hotfix <name>  - Hotfix abschließen"
echo "   git graph                 - Schöner Commit-Graph"
echo ""
echo "🚀 Workflow bereit für souveräne Entwicklung!"