#!/bin/bash

# Neram VPS Setup Automation Script
# Developed for Hostinger VPS (Ubuntu)

set -e

echo "------------------------------------------------"
echo "🚀 Starting Neram VPS Setup..."
echo "------------------------------------------------"

# 1. Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install essential tools
echo "🛠 Installing basic tools..."
sudo apt install -y curl wget git nginx build-essential

# 3. Install Node.js using NVM
if ! command -v nvm &> /dev/null; then
    echo "🟢 Installing NVM and Node.js..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
else
    echo "✅ NVM already installed."
fi

# 4. Install PM2
echo "⚙️ Installing PM2..."
npm install -g pm2

# 5. Setup Project Directory
PROJECT_DIR="/var/www/neram"
echo "📂 Preparing project directory at $PROJECT_DIR..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

echo "------------------------------------------------"
echo "✅ Base setup complete!"
echo "------------------------------------------------"
echo "Next Steps:"
echo "1. Upload your code to $PROJECT_DIR"
echo "2. Run 'npm install && npm run build' in $PROJECT_DIR"
echo "3. Copy server/nginx/neram.conf to /etc/nginx/sites-available/neram"
echo "4. Update 'server_name' in the config"
echo "5. Restart Nginx: sudo systemctl restart nginx"
echo "------------------------------------------------"
