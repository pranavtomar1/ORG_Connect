#!/bin/bash
# Jenkins Installation Script for Ubuntu/Debian
# This script installs Jenkins and required plugins

set -e

echo "========================================"
echo "Jenkins Setup Script"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "Step 1: Updating system packages..."
apt-get update -y

# Install Java (Jenkins requirement)
echo "Step 2: Installing Java..."
apt-get install -y openjdk-17-jdk

# Verify Java installation
java -version

# Install Docker (required for Jenkins to build images)
echo "Step 3: Installing Docker..."
apt-get install -y docker.io
systemctl start docker
systemctl enable docker

# Add jenkins user to docker group (will be created after Jenkins installation)
echo "Step 4: Configuring Docker permissions..."
# This will be done after Jenkins is installed

# Add Jenkins repository
echo "Step 5: Adding Jenkins repository..."
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee \
    /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
    https://pkg.jenkins.io/debian-stable binary/ | tee \
    /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
echo "Step 6: Installing Jenkins..."
apt-get update -y
apt-get install -y jenkins

# Add jenkins user to docker group
usermod -aG docker jenkins

# Install kubectl for Jenkins to use
echo "Step 7: Installing kubectl for Jenkins..."
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/

# Copy kubeconfig for Jenkins
echo "Step 8: Configuring kubectl for Jenkins..."
mkdir -p /var/lib/jenkins/.kube
if [ -f /etc/kubernetes/admin.conf ]; then
    cp /etc/kubernetes/admin.conf /var/lib/jenkins/.kube/config
    chown -R jenkins:jenkins /var/lib/jenkins/.kube
    echo "Kubeconfig copied for Jenkins user"
else
    echo "Warning: Kubernetes admin.conf not found. Make sure to configure kubectl for Jenkins manually."
fi

# Start Jenkins
echo "Step 9: Starting Jenkins..."
systemctl start jenkins
systemctl enable jenkins

# Wait for Jenkins to start
echo "Waiting for Jenkins to start..."
sleep 30

# Get initial admin password
echo ""
echo "========================================"
echo "Jenkins Installation Complete!"
echo "========================================"
echo ""
echo "Jenkins is running on: http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "Initial Admin Password:"
if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
    cat /var/lib/jenkins/secrets/initialAdminPassword
else
    echo "Password file not yet created. Wait a moment and check:"
    echo "  sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
fi
echo ""
echo "Required Jenkins Plugins to Install:"
echo "  - Docker Pipeline"
echo "  - Kubernetes CLI"
echo "  - Git"
echo "  - Pipeline"
echo "  - Credentials Binding"
echo ""
echo "Next Steps:"
echo "1. Access Jenkins at http://YOUR_IP:8080"
echo "2. Complete initial setup wizard"
echo "3. Install suggested plugins + required plugins listed above"
echo "4. Create admin user"
echo "5. Configure Jenkins credentials:"
echo "   - Docker Hub credentials (username/password)"
echo "   - Docker image name (secret text)"
echo "   - Kubeconfig (secret file)"
echo "6. Create a new Pipeline job and point it to your repository"
echo ""
echo "To check Jenkins status:"
echo "  sudo systemctl status jenkins"
echo ""
echo "To restart Jenkins:"
echo "  sudo systemctl restart jenkins"
echo ""

