#!/bin/bash
# Kubernetes Setup Script for Ubuntu/Debian
# This script installs Kubernetes components (kubeadm, kubelet, kubectl)

set -e

echo "========================================"
echo "Kubernetes Setup Script"
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
apt-get upgrade -y

# Install dependencies
echo "Step 2: Installing dependencies..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common

# Disable swap (required for Kubernetes)
echo "Step 3: Disabling swap..."
swapoff -a
sed -i '/ swap / s/^/#/' /etc/fstab

# Load required kernel modules
echo "Step 4: Loading kernel modules..."
cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

# Set sysctl parameters
echo "Step 5: Configuring sysctl parameters..."
cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sysctl --system

# Install containerd
echo "Step 6: Installing containerd..."
apt-get install -y containerd

# Configure containerd
mkdir -p /etc/containerd
containerd config default | tee /etc/containerd/config.toml

# Enable SystemdCgroup
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# Restart containerd
systemctl restart containerd
systemctl enable containerd

# Add Kubernetes apt repository
echo "Step 7: Adding Kubernetes apt repository..."
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | tee /etc/apt/sources.list.d/kubernetes.list

# Install Kubernetes components
echo "Step 8: Installing Kubernetes components..."
apt-get update -y
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl

# Enable kubelet
systemctl enable kubelet

# Verify installation
echo ""
echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo ""
echo "Installed versions:"
kubeadm version
kubelet --version
kubectl version --client

echo ""
echo "Next steps:"
echo "1. Run './init-cluster.sh' to initialize the Kubernetes cluster"
echo "2. Or manually initialize with: kubeadm init --pod-network-cidr=10.244.0.0/16"
echo ""

