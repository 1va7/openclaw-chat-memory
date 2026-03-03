#!/bin/bash
# OpenClaw Chat Memory Manager - Installation Script

set -e

echo "🚀 Installing OpenClaw Chat Memory Manager..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18.x"
    exit 1
fi

if ! command -v openclaw &> /dev/null; then
    echo "❌ OpenClaw is not installed. Please install OpenClaw first"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be >= 18.x (current: $(node -v))"
    exit 1
fi

echo "✓ Prerequisites met"

# Detect workspace directory
WORKSPACE_DIR="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
if [ ! -d "$WORKSPACE_DIR" ]; then
    echo "❌ OpenClaw workspace not found at $WORKSPACE_DIR"
    exit 1
fi

echo "✓ Workspace found: $WORKSPACE_DIR"

# Copy scripts
echo "📦 Installing scripts..."
mkdir -p "$WORKSPACE_DIR/scripts"
cp scripts/*.mjs "$WORKSPACE_DIR/scripts/"
chmod +x "$WORKSPACE_DIR/scripts"/*.mjs
echo "✓ Scripts installed"

# Copy skill
echo "📦 Installing skill..."
mkdir -p "$WORKSPACE_DIR/skills/chat-history-search/scripts"
cp skills/chat-history-search/SKILL.md "$WORKSPACE_DIR/skills/chat-history-search/"
cp skills/chat-history-search/scripts/*.mjs "$WORKSPACE_DIR/skills/chat-history-search/scripts/"
echo "✓ Skill installed"

# Copy templates
echo "📦 Installing templates..."
mkdir -p "$WORKSPACE_DIR/templates"
cp templates/*.template "$WORKSPACE_DIR/templates/"
echo "✓ Templates installed"

# Create config if not exists
if [ ! -f "$WORKSPACE_DIR/config.json" ]; then
    echo "📝 Creating config file..."
    cp config/config.example.json "$WORKSPACE_DIR/config.json"
    echo "⚠️  Please edit $WORKSPACE_DIR/config.json and fill in your Feishu credentials"
else
    echo "ℹ️  Config file already exists, skipping"
fi

# Create chats directory
mkdir -p "$WORKSPACE_DIR/chats"
echo "✓ Chats directory created"

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit $WORKSPACE_DIR/config.json and fill in your Feishu App ID and Secret"
echo "2. Get your credentials from https://open.feishu.cn/app"
echo "3. Restart OpenClaw gateway: openclaw gateway restart"
echo "4. Test the installation: node $WORKSPACE_DIR/scripts/export-chat-history.mjs --help"
echo ""
echo "📚 Documentation: https://github.com/va7/openclaw-chat-memory"
echo ""
