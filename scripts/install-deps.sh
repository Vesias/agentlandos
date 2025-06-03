#!/bin/bash
# Installation script for AGENT_LAND_SAARLAND dependencies

echo "Installing AGENT_LAND_SAARLAND dependencies..."

# Navigate to web app directory
cd apps/web

# Install required npm packages
echo "Installing npm packages..."
npm install --save \
  @radix-ui/react-tooltip \
  framer-motion \
  lucide-react

# Install Tailwind CSS plugins (optional, for enhanced forms and typography)
# npm install -D @tailwindcss/forms @tailwindcss/typography

echo "Dependencies installed successfully!"

# Navigate to API directory
cd ../api

# Install Python dependencies if poetry is available
if command -v poetry &> /dev/null; then
    echo "Installing Python dependencies..."
    poetry install
else
    echo "Poetry not found. Please install Poetry to manage Python dependencies."
fi

echo "Setup complete! You can now run:"
echo "  - Frontend: cd apps/web && npm run dev"
echo "  - Backend: cd apps/api && poetry run uvicorn app.main:app --reload"