#!/bin/bash
# CloudCart EC2 Auto-Deployment script

set -e # Exit on any failure

echo "========================================="
echo "Starting CloudCart EC2 Deployment Script"
echo "========================================="

# 1. Update system packages
echo "Updating apt packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Node.js (V20 LTS) & NPM
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 3. Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt-get install -y nginx
fi

# 4. Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    sudo npm install -y -g pm2
fi

# 5. Create deployment directory and copy project
PROJECT_DIR="/var/web/cloudcart"
echo "Setting up project directory at ${PROJECT_DIR}..."
sudo mkdir -p ${PROJECT_DIR}
sudo chown -R $USER:$USER ${PROJECT_DIR}

# Assuming deployment files are copied here via Github Actions or CI/CD
# Copy files into PROJECT_DIR (simulate copying source code)
cp -r ../../backend ${PROJECT_DIR}/
cp -r ../../frontend ${PROJECT_DIR}/
cp -r ../../aws ${PROJECT_DIR}/

# 6. Install Backend Dependencies
echo "Installing backend dependencies..."
cd ${PROJECT_DIR}/backend
npm install --omit=dev

# Create uploads folder
mkdir -p uploads

# 7. Install Frontend Dependencies & Build
echo "Building React static files..."
cd ${PROJECT_DIR}/frontend
npm install
npm run build

# 8. Configure Nginx Virtual Host
echo "Configuring Nginx reverse proxy..."
sudo cp ${PROJECT_DIR}/aws/nginx/cloudcart.conf /etc/nginx/sites-available/cloudcart
sudo ln -sf /etc/nginx/sites-available/cloudcart /etc/nginx/sites-enabled/
# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx and reload
sudo nginx -t
sudo systemctl reload nginx

# 9. Start/Restart PM2 Backend Process
echo "Starting Node server via PM2..."
cd ${PROJECT_DIR}/aws/pm2
mkdir -p ../logs
pm2 startOrReload ecosystem.config.js --env production
pm2 save

# Setup PM2 startup scripts to launch on EC2 reboot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

echo "========================================="
echo "CloudCart Deployment Completed Successfully!"
echo "========================================="
