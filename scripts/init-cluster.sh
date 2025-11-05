#!/bin/bash
# Initialize Kubernetes Cluster
# This script initializes a single-node Kubernetes cluster

set -e

echo "========================================"
echo "Kubernetes Cluster Initialization"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Get the node's IP address
NODE_IP=$(hostname -I | awk '{print $1}')
echo "Node IP: $NODE_IP"
echo ""

# Initialize Kubernetes cluster
echo "Step 1: Initializing Kubernetes cluster..."
kubeadm init \
    --pod-network-cidr=10.244.0.0/16 \
    --apiserver-advertise-address=$NODE_IP \
    --node-name=$(hostname)

echo ""
echo "Step 2: Setting up kubectl for current user..."

# Set up kubectl for root user
export KUBECONFIG=/etc/kubernetes/admin.conf

# Set up kubectl for non-root user (if you have one)
if [ -n "$SUDO_USER" ]; then
    USER_HOME=$(eval echo ~$SUDO_USER)
    mkdir -p $USER_HOME/.kube
    cp -f /etc/kubernetes/admin.conf $USER_HOME/.kube/config
    chown -R $SUDO_USER:$SUDO_USER $USER_HOME/.kube
    echo "kubectl configured for user: $SUDO_USER"
fi

# Also configure for root
mkdir -p /root/.kube
cp -f /etc/kubernetes/admin.conf /root/.kube/config

echo ""
echo "Step 3: Installing Pod Network (Flannel)..."
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

# Allow scheduling on master node (for single-node setup)
echo ""
echo "Step 4: Allowing scheduling on master node..."
kubectl taint nodes --all node-role.kubernetes.io/control-plane- || true

# Install NGINX Ingress Controller
echo ""
echo "Step 5: Installing NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/baremetal/deploy.yaml

# Wait for ingress controller to be ready
echo ""
echo "Waiting for NGINX Ingress Controller to be ready..."
kubectl wait --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=300s || true

# Install metrics server (optional, but useful)
echo ""
echo "Step 6: Installing Metrics Server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch metrics server for insecure TLS (needed for local development)
kubectl patch deployment metrics-server -n kube-system --type='json' \
    -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]' || true

# Display cluster info
echo ""
echo "========================================"
echo "Cluster Initialization Complete!"
echo "========================================"
echo ""
echo "Cluster Information:"
kubectl cluster-info
echo ""
echo "Nodes:"
kubectl get nodes
echo ""
echo "System Pods:"
kubectl get pods -n kube-system
echo ""
echo "Ingress Controller:"
kubectl get pods -n ingress-nginx
echo ""
echo "To use kubectl, run:"
echo "  export KUBECONFIG=/etc/kubernetes/admin.conf"
echo ""
echo "Or for non-root user:"
echo "  mkdir -p \$HOME/.kube"
echo "  sudo cp -i /etc/kubernetes/admin.conf \$HOME/.kube/config"
echo "  sudo chown \$(id -u):\$(id -g) \$HOME/.kube/config"
echo ""
echo "Next steps:"
echo "1. Run './jenkins-setup.sh' to install Jenkins"
echo "2. Deploy your application using './deploy-app.sh'"
echo ""

