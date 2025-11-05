#!/bin/bash
# Manual Deployment Script
# This script allows manual deployment and testing of the application

set -e

# Configuration
NAMESPACE="orgconnect"
APP_NAME="orgconnect"
DOCKER_IMAGE=${DOCKER_IMAGE:-"yourusername/orgconnect"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "OrgConnect Deployment Script"
echo "========================================"
echo ""

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if connected to cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Not connected to Kubernetes cluster. Please configure kubectl."
    exit 1
fi

# Menu function
show_menu() {
    echo ""
    echo "Select an option:"
    echo "1) Deploy to Blue environment"
    echo "2) Deploy to Green environment"
    echo "3) Switch traffic to Blue"
    echo "4) Switch traffic to Green"
    echo "5) Show current status"
    echo "6) Test health endpoints"
    echo "7) Scale deployment"
    echo "8) Rollback to previous version"
    echo "9) Clean up all resources"
    echo "0) Exit"
    echo ""
    read -p "Enter your choice: " choice
}

# Deploy function
deploy_environment() {
    local ENV=$1
    print_info "Deploying to $ENV environment..."
    
    # Create namespace if not exists
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply configurations
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    
    # Update deployment with actual image
    sed "s|\${DOCKER_IMAGE}:|\${IMAGE_TAG}|$DOCKER_IMAGE:$IMAGE_TAG|g" \
        k8s/deployment-$ENV.yaml | kubectl apply -f -
    
    kubectl apply -f k8s/service-$ENV.yaml
    kubectl apply -f k8s/service-active.yaml
    kubectl apply -f k8s/ingress.yaml
    
    print_info "Waiting for deployment to be ready..."
    kubectl rollout status deployment/$APP_NAME-$ENV -n $NAMESPACE --timeout=5m
    
    print_info "Deployment to $ENV completed successfully!"
}

# Switch traffic function
switch_traffic() {
    local ENV=$1
    print_info "Switching traffic to $ENV environment..."
    
    kubectl patch service $APP_NAME-active -n $NAMESPACE \
        -p "{\"spec\":{\"selector\":{\"version\":\"$ENV\"}}}"
    
    print_info "Traffic switched to $ENV successfully!"
}

# Show status function
show_status() {
    print_info "Current Cluster Status:"
    echo ""
    
    echo "Nodes:"
    kubectl get nodes
    echo ""
    
    echo "Deployments:"
    kubectl get deployments -n $NAMESPACE
    echo ""
    
    echo "Pods:"
    kubectl get pods -n $NAMESPACE -o wide
    echo ""
    
    echo "Services:"
    kubectl get services -n $NAMESPACE
    echo ""
    
    echo "Active Service Selector:"
    kubectl get service $APP_NAME-active -n $NAMESPACE -o jsonpath='{.spec.selector}'
    echo ""
    echo ""
    
    echo "Ingress:"
    kubectl get ingress -n $NAMESPACE
    echo ""
}

# Test health function
test_health() {
    print_info "Testing health endpoints..."
    echo ""
    
    # Get node IP
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
    NODE_PORT=30080
    
    echo "Testing Blue environment:"
    kubectl run test-blue --image=curlimages/curl:latest --restart=Never -n $NAMESPACE --rm -i --timeout=30s \
        -- curl -s http://$APP_NAME-blue.$NAMESPACE.svc.cluster.local/health || print_warning "Blue environment not responding"
    
    echo ""
    echo "Testing Green environment:"
    kubectl run test-green --image=curlimages/curl:latest --restart=Never -n $NAMESPACE --rm -i --timeout=30s \
        -- curl -s http://$APP_NAME-green.$NAMESPACE.svc.cluster.local/health || print_warning "Green environment not responding"
    
    echo ""
    echo "Testing Active service:"
    kubectl run test-active --image=curlimages/curl:latest --restart=Never -n $NAMESPACE --rm -i --timeout=30s \
        -- curl -s http://$APP_NAME-active.$NAMESPACE.svc.cluster.local/health || print_warning "Active service not responding"
    
    echo ""
    print_info "You can also access the application at: http://$NODE_IP:$NODE_PORT"
}

# Scale function
scale_deployment() {
    read -p "Enter environment (blue/green): " ENV
    read -p "Enter number of replicas: " REPLICAS
    
    print_info "Scaling $ENV environment to $REPLICAS replicas..."
    kubectl scale deployment/$APP_NAME-$ENV -n $NAMESPACE --replicas=$REPLICAS
    
    print_info "Scaling completed!"
}

# Rollback function
rollback() {
    read -p "Enter environment to rollback (blue/green): " ENV
    
    print_info "Rolling back $ENV environment..."
    kubectl rollout undo deployment/$APP_NAME-$ENV -n $NAMESPACE
    
    print_info "Rollback completed!"
}

# Clean up function
cleanup() {
    print_warning "This will delete all resources in namespace: $NAMESPACE"
    read -p "Are you sure? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" = "yes" ]; then
        print_info "Cleaning up resources..."
        kubectl delete namespace $NAMESPACE --timeout=60s || true
        print_info "Cleanup completed!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1)
            deploy_environment "blue"
            ;;
        2)
            deploy_environment "green"
            ;;
        3)
            switch_traffic "blue"
            ;;
        4)
            switch_traffic "green"
            ;;
        5)
            show_status
            ;;
        6)
            test_health
            ;;
        7)
            scale_deployment
            ;;
        8)
            rollback
            ;;
        9)
            cleanup
            ;;
        0)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option. Please try again."
            ;;
    esac
done

