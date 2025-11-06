# Complete Deployment Guide - Blue-Green Deployment with Jenkins, Kubernetes & AWS

**Project:** OrgConnect Collaborative Platform  
**Author:** Pranav Tomar  
**Docker Hub:** https://hub.docker.com/r/pranavtomar1/orgconnect  
**GitHub Repository:** https://github.com/pranavtomar1/ORG_Connect  
**Application URL:** http://54.175.47.56:30080  
**Jenkins URL:** http://54.175.47.56:8080

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
5. [Blue-Green Deployment Process](#blue-green-deployment-process)
6. [Verification & Testing](#verification-testing)
7. [Troubleshooting](#troubleshooting)
8. [Cost Analysis](#cost-analysis)
9. [Resources & Links](#resources-links)

---

## Prerequisites

### Required Accounts

1. **AWS Account**
   - Sign up: https://aws.amazon.com/free/
   - Free tier: https://aws.amazon.com/free/
   - Student credits: https://aws.amazon.com/education/awseducate/
   - **Your AWS Account ID:** 102382809436

2. **Docker Hub Account**
   - Sign up: https://hub.docker.com/signup
   - **Your Username:** pranavtomar1
   - **Your Repository:** https://hub.docker.com/r/pranavtomar1/orgconnect

3. **GitHub Account**
   - Sign up: https://github.com/signup
   - **Your Repository:** https://github.com/pranavtomar1/ORG_Connect

### Required Tools (Local Machine)

1. **AWS CLI**
   - Download: https://aws.amazon.com/cli/
   - Installation guide: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
   - **Your Version:** aws-cli/1.42.62

2. **Git**
   - Download: https://git-scm.com/downloads
   - Documentation: https://git-scm.com/doc

3. **SSH Client**
   - Windows: Git Bash or PuTTY
   - Mac/Linux: Built-in terminal

### AWS Configuration

```bash
# Configure AWS CLI
aws configure
# AWS Access Key ID: [Your access key]
# AWS Secret Access Key: [Your secret key]
# Default region name: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

**Your AWS Identity:**
```json
{
    "UserId": "AIDARPVT5WFOIOOU7HNGI",
    "Account": "102382809436",
    "Arn": "arn:aws:iam::102382809436:user/hr-ai-admin"
}
```

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              EC2 Instance (t3.small)                   │  │
│  │              IP: 54.175.47.56                          │  │
│  │  ┌──────────────────────────────────────────────┐     │  │
│  │  │         Kubernetes Cluster                   │     │  │
│  │  │  ┌────────────┐      ┌────────────┐         │     │  │
│  │  │  │   Blue     │      │   Green    │         │     │  │
│  │  │  │   v1.0     │      │   v2.0     │         │     │  │
│  │  │  └─────┬──────┘      └──────┬─────┘         │     │  │
│  │  │        │                    │               │     │  │
│  │  │        └─────────┬──────────┘               │     │  │
│  │  │                  │                          │     │  │
│  │  │         ┌────────▼────────┐                 │     │  │
│  │  │         │ Active Service  │◄────────┐       │     │  │
│  │  │         │  NodePort:30080 │         │       │     │  │
│  │  │         └────────┬────────┘   Traffic│       │     │  │
│  │  │                  │            Switch │       │     │  │
│  │  └──────────────────┼────────────────────┘     │     │  │
│  │                     │                          │     │  │
│  │  ┌──────────────────▼───────────────────────┐ │     │  │
│  │  │         Jenkins CI/CD Server             │ │     │  │
│  │  │         Port: 8080                        │ │     │  │
│  │  └──────────────────────────────────────────┘ │     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    End Users Access
            http://54.175.47.56:30080
```

### Technology Stack

| Component | Technology | Version | Documentation |
|-----------|-----------|---------|---------------|
| Cloud Provider | AWS EC2 | - | https://aws.amazon.com/ec2/ |
| Container Orchestration | Kubernetes | v1.28.15 | https://kubernetes.io/docs/ |
| CI/CD Automation | Jenkins | Latest | https://www.jenkins.io/doc/ |
| Containerization | Docker | Latest | https://docs.docker.com/ |
| Container Runtime | containerd | Latest | https://containerd.io/ |
| Network Plugin | Flannel | Latest | https://github.com/flannel-io/flannel |
| Ingress Controller | NGINX | v1.8.1 | https://kubernetes.github.io/ingress-nginx/ |
| Frontend Framework | React | 18.3.1 | https://react.dev/ |
| Language | TypeScript | 5.5.3 | https://www.typescriptlang.org/ |
| Build Tool | Vite | 5.4.2 | https://vitejs.dev/ |
| Web Server | Nginx | Alpine | https://nginx.org/en/docs/ |

---

## Step-by-Step Deployment

### Step 1: AWS Infrastructure Setup (10 minutes)

#### 1.1 Create Key Pair

```bash
# Create SSH key pair
aws ec2 create-key-pair \
  --key-name orgconnect-key \
  --query 'KeyMaterial' \
  --output text > orgconnect-key.pem

# Set permissions (Windows PowerShell)
icacls orgconnect-key.pem /inheritance:r /grant "$env:USERNAME`:R"

# Or on Mac/Linux
chmod 400 orgconnect-key.pem
```

**AWS Console Link:** https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#KeyPairs:

#### 1.2 Create Security Group

```bash
# Create security group
aws ec2 create-security-group \
  --group-name orgconnect-sg \
  --description "Security group for OrgConnect blue-green deployment"

# Output: sg-01fa7cd33889c744f

# Get your public IP
$myip = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
echo $myip
# Output: 223.178.87.90
```

**Your Security Group:** sg-01fa7cd33889c744f

**Add Security Rules:**

```bash
# SSH access (port 22)
aws ec2 authorize-security-group-ingress \
  --group-id sg-01fa7cd33889c744f \
  --protocol tcp --port 22 \
  --cidr 223.178.87.90/32

# HTTP access (port 80)
aws ec2 authorize-security-group-ingress \
  --group-id sg-01fa7cd33889c744f \
  --protocol tcp --port 80 \
  --cidr 0.0.0.0/0

# Jenkins UI (port 8080)
aws ec2 authorize-security-group-ingress \
  --group-id sg-01fa7cd33889c744f \
  --protocol tcp --port 8080 \
  --cidr 223.178.87.90/32

# Kubernetes NodePort (port 30080)
aws ec2 authorize-security-group-ingress \
  --group-id sg-01fa7cd33889c744f \
  --protocol tcp --port 30080 \
  --cidr 0.0.0.0/0

# Kubernetes API (port 6443)
aws ec2 authorize-security-group-ingress \
  --group-id sg-01fa7cd33889c744f \
  --protocol tcp --port 6443 \
  --cidr 172.31.0.0/16

# EC2 Instance Connect IPs
aws ec2 authorize-security-group-ingress \
  --group-id sg-01fa7cd33889c744f \
  --protocol tcp --port 22 \
  --cidr 18.206.107.24/29
```

**AWS Console Link:** https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#SecurityGroups:

#### 1.3 Launch EC2 Instance

```bash
# Get latest Ubuntu 22.04 AMI
aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query "Images | sort_by(@, &CreationDate) | [-1].ImageId" \
  --output text
# Output: ami-0c398cb65a93047f2

# Launch t3.small instance
aws ec2 run-instances \
  --image-id ami-0c398cb65a93047f2 \
  --instance-type t3.small \
  --key-name orgconnect-key \
  --security-group-ids sg-01fa7cd33889c744f \
  --block-device-mappings '[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"VolumeSize\":30,\"VolumeType\":\"gp3\"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=orgconnect-k8s-jenkins}]' \
  --query "Instances[0].InstanceId" \
  --output text
# Output: i-09660a6a27791808d

# Wait for instance to be running
aws ec2 wait instance-running --instance-ids i-09660a6a27791808d

# Get public IP
aws ec2 describe-instances \
  --instance-ids i-09660a6a27791808d \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text
# Output: 54.175.47.56
```

**Your Instance Details:**
- **Instance ID:** i-09660a6a27791808d
- **Public IP:** 54.175.47.56
- **Private IP:** 172.31.21.94
- **Instance Type:** t3.small
- **Storage:** 30GB gp3

**AWS Console Link:** https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#Instances:instanceState=running

#### 1.4 Configure IAM Role for Systems Manager

```bash
# Create IAM role
aws iam create-role \
  --role-name OrgConnectEC2SSMRole \
  --assume-role-policy-document '{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"ec2.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}'

# Attach SSM policy
aws iam attach-role-policy \
  --role-name OrgConnectEC2SSMRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# Create instance profile
aws iam create-instance-profile \
  --instance-profile-name OrgConnectEC2SSMProfile

# Add role to profile
aws iam add-role-to-instance-profile \
  --instance-profile-name OrgConnectEC2SSMProfile \
  --role-name OrgConnectEC2SSMRole

# Wait for propagation
Start-Sleep -Seconds 10

# Associate with instance
aws ec2 associate-iam-instance-profile \
  --instance-id i-09660a6a27791808d \
  --iam-instance-profile Name=OrgConnectEC2SSMProfile
```

**IAM Console Link:** https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/roles

---

### Step 2: Connect to EC2 Instance (2 minutes)

#### Option 1: EC2 Instance Connect (Browser - Recommended)

1. **Open AWS Console:** https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#Instances:
2. **Select instance:** orgconnect-k8s-jenkins (i-09660a6a27791808d)
3. **Click "Connect"** button
4. **Select "EC2 Instance Connect"** tab
5. **Click "Connect"** button
6. **Browser terminal opens**

#### Option 2: SSH (Local Terminal)

```bash
ssh -i orgconnect-key.pem ubuntu@54.175.47.56
```

#### Option 3: AWS CloudShell

**CloudShell Link:** https://us-east-1.console.aws.amazon.com/cloudshell/home?region=us-east-1

```bash
# In CloudShell
aws ssm start-session --target i-09660a6a27791808d --region us-east-1
```

---

### Step 3: Install Kubernetes (15 minutes)

**Once connected to EC2, run these commands:**

#### 3.1 Clone Repository

```bash
# Update system
sudo apt update -y

# Install git
sudo apt install git -y

# Clone repository
git clone https://github.com/pranavtomar1/ORG_Connect.git
cd ORG_Connect

# Make scripts executable
chmod +x scripts/*.sh

# List scripts
ls -la scripts/
```

**GitHub Repository:** https://github.com/pranavtomar1/ORG_Connect

#### 3.2 Install Kubernetes Components

```bash
# Run Kubernetes setup script (5-10 minutes)
sudo ./scripts/setup-k8s.sh
```

**This installs:**
- kubeadm v1.28.15
- kubelet v1.28.15
- kubectl v1.28.15
- containerd
- Required kernel modules

**Kubernetes Documentation:** https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/

#### 3.3 Initialize Kubernetes Cluster

```bash
# Initialize cluster (5-10 minutes)
sudo ./scripts/init-cluster.sh
```

**This configures:**
- Kubernetes control plane
- Flannel network plugin: https://github.com/flannel-io/flannel
- NGINX Ingress Controller: https://kubernetes.github.io/ingress-nginx/
- Metrics Server: https://github.com/kubernetes-sigs/metrics-server
- Single-node setup (allows scheduling on master)

**Verify Installation:**

```bash
# Check nodes
kubectl get nodes
# Should show: Ready

# Check all pods
kubectl get pods --all-namespaces

# Check cluster info
kubectl cluster-info
```

**Kubernetes Dashboard (Optional):** https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/

---

### Step 4: Install Jenkins (15 minutes)

#### 4.1 Run Jenkins Installation Script

```bash
# Install Jenkins (5-10 minutes)
sudo ./scripts/jenkins-setup.sh
```

**This installs:**
- Java 17 (OpenJDK)
- Docker
- Jenkins LTS
- Configures kubectl for Jenkins user

**Jenkins Documentation:** https://www.jenkins.io/doc/book/installing/

#### 4.2 Get Jenkins Initial Password

```bash
# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Your Initial Password:** f6671a1617a442f0ba72755950efde42

#### 4.3 Access Jenkins Web UI

**Jenkins URL:** http://54.175.47.56:8080

1. **Open browser:** http://54.175.47.56:8080
2. **Enter password:** f6671a1617a442f0ba72755950efde42
3. **Click "Continue"**

#### 4.4 Install Plugins

1. **Click "Install suggested plugins"**
2. **Wait for installation** (~2-3 minutes)

**Additional Required Plugins:**
- Go to: http://54.175.47.56:8080/manage/pluginManager/available
- Search and install:
  - **Docker Pipeline** - https://plugins.jenkins.io/docker-workflow/
  - **Kubernetes CLI** - https://plugins.jenkins.io/kubernetes-cli/
  - **Git** - https://plugins.jenkins.io/git/
  - **Credentials Binding** - https://plugins.jenkins.io/credentials-binding/

#### 4.5 Create Admin User

- **Username:** admin
- **Password:** [Choose secure password]
- **Full Name:** Pranav Tomar
- **Email:** pranav@example.com

#### 4.6 Configure Jenkins URL

- **Jenkins URL:** http://54.175.47.56:8080/
- **Click "Save and Finish"**
- **Click "Start using Jenkins"**

**Jenkins Dashboard:** http://54.175.47.56:8080/

---

### Step 5: Configure Jenkins Credentials (5 minutes)

#### 5.1 Add Docker Hub Credentials

1. **Go to:** http://54.175.47.56:8080/manage/credentials/
2. **Click "(global)" domain**
3. **Click "Add Credentials"**

**Credential 1: Docker Hub Login**
- **Kind:** Username with password
- **Scope:** Global
- **Username:** pranavtomar1
- **Password:** [Your Docker Hub password]
- **ID:** docker-credentials
- **Description:** Docker Hub Login Credentials
- **Click "Create"**

**Docker Hub Link:** https://hub.docker.com/settings/security

#### 5.2 Verify Credentials

**Credentials Page:** http://54.175.47.56:8080/manage/credentials/store/system/domain/_/

You should see:
- ✅ docker-credentials (Username with password)

---

### Step 6: Create Jenkins Pipeline (5 minutes)

#### 6.1 Create New Pipeline Job

1. **Go to:** http://54.175.47.56:8080/
2. **Click "New Item"**
3. **Enter name:** orgconnect-pipeline
4. **Select:** Pipeline
5. **Click "OK"**

#### 6.2 Configure Pipeline

**General Section:**
- ☑️ **GitHub project**
- **Project url:** https://github.com/pranavtomar1/ORG_Connect/

**Build Triggers:**
- ☑️ **Poll SCM**
- **Schedule:** `H/5 * * * *` (checks every 5 minutes)

**Pipeline Section:**
- **Definition:** Pipeline script from SCM
- **SCM:** Git
- **Repository URL:** https://github.com/pranavtomar1/ORG_Connect.git
- **Credentials:** None (public repo)
- **Branch Specifier:** */main
- **Script Path:** Jenkinsfile

**Click "Save"**

**Pipeline URL:** http://54.175.47.56:8080/job/orgconnect-pipeline/

**Jenkinsfile on GitHub:** https://github.com/pranavtomar1/ORG_Connect/blob/main/Jenkinsfile

---

### Step 7: Build and Push Docker Image (10 minutes)

#### 7.1 Build Docker Image

```bash
# On EC2 instance
cd ~/ORG_Connect

# Set environment variables
export DOCKER_IMAGE="pranavtomar1/orgconnect"
export IMAGE_TAG="v1.0"

# Add user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Verify docker works
docker ps

# Build image
docker build -t $DOCKER_IMAGE:$IMAGE_TAG .

# Tag as latest
docker tag $DOCKER_IMAGE:$IMAGE_TAG $DOCKER_IMAGE:latest
```

**Dockerfile:** https://github.com/pranavtomar1/ORG_Connect/blob/main/Dockerfile

**Docker Documentation:** https://docs.docker.com/engine/reference/builder/

#### 7.2 Push to Docker Hub

```bash
# Login to Docker Hub
docker login
# Username: pranavtomar1
# Password: [Your Docker Hub password]

# Push image
docker push $DOCKER_IMAGE:$IMAGE_TAG
docker push $DOCKER_IMAGE:latest
```

**Your Docker Hub Repository:** https://hub.docker.com/r/pranavtomar1/orgconnect

**Verify on Docker Hub:**
- Go to: https://hub.docker.com/r/pranavtomar1/orgconnect/tags
- You should see: v1.0 and latest tags

---

### Step 8: Deploy to Kubernetes (5 minutes)

#### 8.1 Deploy to Blue Environment

```bash
# Deploy Blue deployment
sed "s|\${DOCKER_IMAGE}:\${IMAGE_TAG}|pranavtomar1/orgconnect:v1.0|g" \
  k8s/deployment-blue.yaml | kubectl apply -f -

# Deploy Blue service
kubectl apply -f k8s/service-blue.yaml

# Deploy Active service
kubectl apply -f k8s/service-active.yaml

# Deploy Ingress
kubectl apply -f k8s/ingress.yaml

# Wait for rollout
kubectl rollout status deployment/orgconnect-blue -n orgconnect --timeout=5m
```

**Kubernetes Manifests:** https://github.com/pranavtomar1/ORG_Connect/tree/main/k8s

#### 8.2 Verify Deployment

```bash
# Check all resources
kubectl get all -n orgconnect

# Check pods
kubectl get pods -n orgconnect

# Check services
kubectl get svc -n orgconnect

# Check active service selector
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector.version}'
# Should output: blue
```

**Kubernetes Dashboard:** https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/

---

### Step 9: Access Application (1 minute)

#### 9.1 Get Application URL

**Your Application URL:** http://54.175.47.56:30080

**Open in browser:**
- http://54.175.47.56:30080

**You should see:**
- OrgConnect Collaborative Platform
- Login page
- Working application

#### 9.2 Test Health Endpoint

```bash
# Test health endpoint
curl http://54.175.47.56:30080/health
# Should return: healthy
```

**Health Check URL:** http://54.175.47.56:30080/health

---

## CI/CD Pipeline Setup

### Pipeline Architecture

```
Code Change (git push)
    ↓
GitHub Repository
    ↓
Jenkins Poll (every 5 min)
    ↓
[Stage 1] Checkout Code
    ↓
[Stage 2] Build Docker Image
    ↓
[Stage 3] Push to Docker Hub
    ↓
[Stage 4] Determine Active Environment
    ↓
[Stage 5] Deploy to Inactive Environment
    ↓
[Stage 6] Health Check
    ↓
[Stage 7] Switch Traffic
    ↓
[Stage 8] Verify Deployment
    ↓
[Stage 9] Scale Down Old Environment
    ↓
Deployment Complete ✓
```

### Jenkins Pipeline Stages

**Pipeline URL:** http://54.175.47.56:8080/job/orgconnect-pipeline/

| Stage | Description | Time | Status Check |
|-------|-------------|------|--------------|
| 1. Checkout | Pull code from GitHub | ~10s | Git clone successful |
| 2. Build Docker Image | Build container image | ~2m | Image built: pranavtomar1/orgconnect:N |
| 3. Push to Registry | Upload to Docker Hub | ~1m | Image pushed successfully |
| 4. Determine Active | Check current environment | ~5s | Active: blue/green |
| 5. Deploy to Target | Deploy to inactive env | ~1m | Rollout successful |
| 6. Health Check | Verify new deployment | ~30s | Health check passed |
| 7. Switch Traffic | Route to new version | ~10s | Traffic switched |
| 8. Verify | Post-deployment checks | ~10s | Verification complete |
| 9. Scale Down Old | Remove old version | ~10s | Scaled to 0 replicas |

**Total Pipeline Time:** ~5-7 minutes

### Trigger Pipeline

#### Method 1: Automatic (SCM Polling)

**Configured to check every 5 minutes:**
- Jenkins polls: https://github.com/pranavtomar1/ORG_Connect.git
- If changes detected, pipeline triggers automatically

#### Method 2: Manual Trigger

1. **Go to:** http://54.175.47.56:8080/job/orgconnect-pipeline/
2. **Click "Build Now"**
3. **Watch console output:** http://54.175.47.56:8080/job/orgconnect-pipeline/lastBuild/console

#### Method 3: GitHub Webhook (Optional)

**Setup webhook:**
1. **Go to:** https://github.com/pranavtomar1/ORG_Connect/settings/hooks
2. **Click "Add webhook"**
3. **Payload URL:** http://54.175.47.56:8080/github-webhook/
4. **Content type:** application/json
5. **Events:** Just the push event
6. **Click "Add webhook"**

**Webhook Documentation:** https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks

---

## Blue-Green Deployment Process

### What is Blue-Green Deployment?

**Martin Fowler's Definition:** https://martinfowler.com/bliki/BlueGreenDeployment.html

Blue-Green deployment is a technique that reduces downtime and risk by running two identical production environments called Blue and Green.

### Deployment States

#### State 1: Blue Active (Initial)
```
Blue Environment (v1.0)  ← Active ← Traffic ← Users
Green Environment        ← Empty
```

#### State 2: Deploy to Green
```
Blue Environment (v1.0)  ← Active ← Traffic ← Users
Green Environment (v2.0) ← Deploying... (Health Checks)
```

#### State 3: Switch Traffic
```
Blue Environment (v1.0)  ← Standby (Ready for rollback)
Green Environment (v2.0) ← Active ← Traffic ← Users
```

#### State 4: Scale Down Blue
```
Blue Environment         ← Scaled to 0
Green Environment (v2.0) ← Active ← Traffic ← Users
```

### Manual Blue-Green Deployment

#### Step 1: Check Current State

```bash
# Check which environment is active
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector.version}'
# Output: blue

# Check all deployments
kubectl get deployments -n orgconnect
```

#### Step 2: Make Code Change

```bash
# On your local machine or EC2
cd ~/ORG_Connect

# Edit the app (example: change title)
nano src/App.tsx
# Change line ~85:
# <h1>OrgConnect</h1>
# to:
# <h1>OrgConnect v2.0</h1>

# Save and exit (Ctrl+X, Y, Enter)
```

**GitHub Editor:** https://github.com/pranavtomar1/ORG_Connect/edit/main/src/App.tsx

#### Step 3: Build New Version

```bash
# Set new version
export DOCKER_IMAGE="pranavtomar1/orgconnect"
export IMAGE_TAG="v2.0"

# Build
docker build -t $DOCKER_IMAGE:$IMAGE_TAG .

# Push
docker push $DOCKER_IMAGE:$IMAGE_TAG
```

#### Step 4: Deploy to Green

```bash
# Deploy to Green
sed "s|\${DOCKER_IMAGE}:\${IMAGE_TAG}|pranavtomar1/orgconnect:v2.0|g" \
  k8s/deployment-green.yaml | kubectl apply -f -

kubectl apply -f k8s/service-green.yaml

# Wait for ready
kubectl rollout status deployment/orgconnect-green -n orgconnect --timeout=5m
```

#### Step 5: Test Green Environment

```bash
# Test Green service directly
kubectl run test-green --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl http://orgconnect-green.orgconnect.svc.cluster.local/health

# Check pods
kubectl get pods -n orgconnect -l version=green
```

#### Step 6: Switch Traffic

```bash
# Switch traffic from Blue to Green
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"green"}}}'

# Verify switch
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector.version}'
# Should output: green
```

**Application URL:** http://54.175.47.56:30080  
**Refresh browser** - you should see v2.0 with ZERO downtime!

#### Step 7: Scale Down Blue

```bash
# Scale Blue to 0
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=0

# Verify
kubectl get deployments -n orgconnect
```

### Automated Blue-Green via Jenkins

#### Step 1: Make Code Change

```bash
# On local machine
cd ~/path/to/ORG_Connect

# Make your change
nano src/App.tsx

# Commit and push
git add src/App.tsx
git commit -m "Update to v2.0"
git push origin main
```

**GitHub Commit URL:** https://github.com/pranavtomar1/ORG_Connect/commits/main

#### Step 2: Jenkins Automatic Trigger

- **Jenkins polls every 5 minutes**
- **Detects change automatically**
- **Pipeline starts**

**Or manually trigger:**
- Go to: http://54.175.47.56:8080/job/orgconnect-pipeline/
- Click "Build Now"

#### Step 3: Monitor Pipeline

**Console Output:** http://54.175.47.56:8080/job/orgconnect-pipeline/lastBuild/console

**Blue Ocean View:** http://54.175.47.56:8080/blue/organizations/jenkins/orgconnect-pipeline/activity

Watch the stages execute:
```
✓ Checkout
✓ Build Docker Image  
✓ Push to Registry
✓ Determine Active Environment (finds Blue)
✓ Deploy to Target Environment (deploys to Green)
✓ Health Check on Target (tests Green)
✓ Switch Traffic (routes to Green)
✓ Post-Deployment Verification
✓ Scale Down Old Environment (scales down Blue)
```

#### Step 4: Verify Zero Downtime

**During deployment:**
- Keep http://54.175.47.56:30080 open
- Keep refreshing
- You should see NO errors
- Application stays available

**After deployment:**
- Application shows new version
- No downtime occurred
- Old version available for rollback

---

## Verification & Testing

### Health Checks

#### Application Health

```bash
# Health endpoint
curl http://54.175.47.56:30080/health
# Expected: healthy

# Full application test
curl -I http://54.175.47.56:30080
# Expected: HTTP/1.1 200 OK
```

**Health Check URL:** http://54.175.47.56:30080/health

#### Kubernetes Health

```bash
# Check node health
kubectl get nodes
# Expected: STATUS = Ready

# Check pod health
kubectl get pods -n orgconnect
# Expected: STATUS = Running, READY = 1/1

# Check deployments
kubectl get deployments -n orgconnect
# Expected: READY = N/N, AVAILABLE = N
```

**Kubernetes API:** https://172.31.21.94:6443

#### Jenkins Health

```bash
# Check Jenkins service
sudo systemctl status jenkins
# Expected: active (running)

# Test Jenkins URL
curl -I http://54.175.47.56:8080
# Expected: HTTP/1.1 200 OK
```

**Jenkins URL:** http://54.175.47.56:8080

### Testing Zero Downtime

#### Setup Continuous Monitoring

```bash
# On EC2 or local machine
# Run continuous health checks
while true; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://54.175.47.56:30080/health)
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
  echo "$TIMESTAMP - Status: $STATUS"
  if [ "$STATUS" != "200" ]; then
    echo "❌ DOWNTIME DETECTED!"
  fi
  sleep 1
done
```

#### Perform Deployment

While the monitoring script is running:
1. Trigger Jenkins pipeline
2. Watch the output
3. You should see continuous "Status: 200"
4. No errors during traffic switch

**Result:** ✅ Zero downtime verified!

### Load Testing (Optional)

**Apache Bench:**
```bash
# Install Apache Bench
sudo apt install apache2-utils -y

# Run load test
ab -n 1000 -c 10 http://54.175.47.56:30080/
```

**Hey (HTTP load generator):**
```bash
# Install hey
wget https://hey-release.s3.us-east-1.amazonaws.com/hey_linux_amd64
chmod +x hey_linux_amd64
sudo mv hey_linux_amd64 /usr/local/bin/hey

# Run load test
hey -n 1000 -c 10 http://54.175.47.56:30080/
```

**Hey GitHub:** https://github.com/rakyll/hey

---

## Troubleshooting

### Common Issues & Solutions

#### Issue 1: Cannot Access Application

**Symptom:** http://54.175.47.56:30080 times out

**Diagnosis:**
```bash
# Check pods
kubectl get pods -n orgconnect

# Check services
kubectl get svc -n orgconnect

# Check security group
aws ec2 describe-security-groups --group-ids sg-01fa7cd33889c744f
```

**Solutions:**
1. **Security group:** Ensure port 30080 is open
   - https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#SecurityGroups:groupId=sg-01fa7cd33889c744f
2. **Pods not running:** Check logs: `kubectl logs <pod-name> -n orgconnect`
3. **Service selector wrong:** Verify: `kubectl describe svc orgconnect-active -n orgconnect`

#### Issue 2: Jenkins Build Fails at Push

**Symptom:** "unauthorized: incorrect username or password"

**Solution:**
1. **Verify Docker Hub credentials**
   - Go to: http://54.175.47.56:8080/manage/credentials/
   - Update docker-credentials with correct password
   - Password from: https://hub.docker.com/settings/security

2. **Test manually:**
```bash
docker login
# Use same credentials as Jenkins
```

**Jenkins Credentials:** http://54.175.47.56:8080/manage/credentials/store/system/domain/_/

#### Issue 3: Pods Not Starting

**Symptom:** Pods in CrashLoopBackOff or Pending

**Diagnosis:**
```bash
kubectl describe pod <pod-name> -n orgconnect
kubectl logs <pod-name> -n orgconnect
```

**Solutions:**
1. **Image pull error:** Check Docker Hub repository is public
   - https://hub.docker.com/r/pranavtomar1/orgconnect/settings
2. **Resource constraints:** Check node resources
```bash
kubectl top nodes
kubectl describe nodes
```
3. **Health check failing:** Increase initialDelaySeconds in deployment YAML

#### Issue 4: Out of Memory

**Symptom:** Instance becomes unresponsive

**Solution:**
```bash
# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Reduce replicas
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=1
kubectl scale deployment/orgconnect-green -n orgconnect --replicas=1
```

#### Issue 5: Kubernetes Node Not Ready

**Symptom:** `kubectl get nodes` shows NotReady

**Solution:**
```bash
# Check kubelet
sudo systemctl status kubelet

# Check logs
sudo journalctl -u kubelet -n 50

# Restart kubelet
sudo systemctl restart kubelet

# Check CNI plugin
kubectl get pods -n kube-flannel
```

**Kubernetes Troubleshooting:** https://kubernetes.io/docs/tasks/debug/

### Useful Debug Commands

```bash
# Kubernetes
kubectl get events -n orgconnect --sort-by='.lastTimestamp'
kubectl describe pod <pod-name> -n orgconnect
kubectl logs <pod-name> -n orgconnect
kubectl logs <pod-name> -n orgconnect --previous

# Jenkins
sudo journalctl -u jenkins -n 100
sudo tail -f /var/log/jenkins/jenkins.log

# Docker
docker ps -a
docker logs <container-id>
docker system df

# System
free -h
df -h
top
```

### Emergency Rollback

**Quick rollback to previous version:**

```bash
# Switch back to Blue
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"blue"}}}'

# Scale up Blue
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=2

# Verify
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector.version}'
```

**Time to rollback:** < 30 seconds

---

## Cost Analysis

### Monthly Cost Breakdown

| Resource | Type | Cost | Details |
|----------|------|------|---------|
| **EC2 Instance** | t3.small | ~$15.00 | 2 vCPU, 2GB RAM |
| **EBS Volume** | 30GB gp3 | ~$2.40 | 30GB storage |
| **Data Transfer** | Out to Internet | ~$1.00 | First 100GB free |
| **Elastic IP** | (If used) | ~$0.00 | Free while attached |
| **Total** | | **~$18.40** | Per month |

### Cost with $100 Credit

- **Monthly Cost:** $18.40
- **Available Credit:** $100.00
- **Duration:** ~5.4 months
- **Cost per day:** ~$0.61

**AWS Pricing Calculator:** https://calculator.aws/#/

### Cost Optimization Tips

1. **Stop instance when not in use:**
```bash
# Stop instance
aws ec2 stop-instances --instance-ids i-09660a6a27791808d

# Start when needed
aws ec2 start-instances --instance-ids i-09660a6a27791808d
```
Saves ~90% (only pay for storage: ~$2.40/month)

2. **Use Spot Instances:** https://aws.amazon.com/ec2/spot/
   - Up to 90% discount
   - Good for development/testing

3. **Monitor usage:**
   - AWS Cost Explorer: https://console.aws.amazon.com/cost-management/home
   - Set up billing alerts: https://console.aws.amazon.com/billing/home#/budgets

4. **Clean up resources:**
```bash
# Delete unused volumes
aws ec2 describe-volumes --filters "Name=status,Values=available"

# Release unassociated Elastic IPs
aws ec2 describe-addresses --filters "Name=association-id,Values=null"
```

**AWS Free Tier:** https://aws.amazon.com/free/

---

## Resources & Links

### Official Documentation

| Resource | Link |
|----------|------|
| **AWS EC2** | https://docs.aws.amazon.com/ec2/ |
| **Kubernetes** | https://kubernetes.io/docs/ |
| **Jenkins** | https://www.jenkins.io/doc/ |
| **Docker** | https://docs.docker.com/ |
| **React** | https://react.dev/ |
| **TypeScript** | https://www.typescriptlang.org/docs/ |
| **Vite** | https://vitejs.dev/guide/ |
| **Nginx** | https://nginx.org/en/docs/ |

### Your Project Links

| Resource | URL |
|----------|-----|
| **Application** | http://54.175.47.56:30080 |
| **Jenkins** | http://54.175.47.56:8080 |
| **GitHub Repository** | https://github.com/pranavtomar1/ORG_Connect |
| **Docker Hub** | https://hub.docker.com/r/pranavtomar1/orgconnect |
| **AWS Console** | https://us-east-1.console.aws.amazon.com/ |
| **EC2 Instance** | https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#Instances:instanceId=i-09660a6a27791808d |
| **Security Group** | https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#SecurityGroups:groupId=sg-01fa7cd33889c744f |

### Learning Resources

| Topic | Link |
|-------|------|
| **Blue-Green Deployment** | https://martinfowler.com/bliki/BlueGreenDeployment.html |
| **Kubernetes Patterns** | https://kubernetes.io/docs/concepts/cluster-administration/manage-deployment/ |
| **Jenkins Pipeline** | https://www.jenkins.io/doc/book/pipeline/ |
| **Docker Best Practices** | https://docs.docker.com/develop/dev-best-practices/ |
| **AWS Well-Architected** | https://aws.amazon.com/architecture/well-architected/ |

### Community & Support

| Resource | Link |
|----------|------|
| **Kubernetes Slack** | https://kubernetes.slack.com/ |
| **Jenkins Community** | https://community.jenkins.io/ |
| **Docker Forums** | https://forums.docker.com/ |
| **AWS Forums** | https://forums.aws.amazon.com/ |
| **Stack Overflow** | https://stackoverflow.com/ |

### Tools & Utilities

| Tool | Link |
|------|------|
| **AWS CLI** | https://aws.amazon.com/cli/ |
| **kubectl** | https://kubernetes.io/docs/tasks/tools/ |
| **Docker Desktop** | https://www.docker.com/products/docker-desktop/ |
| **VS Code** | https://code.visualstudio.com/ |
| **Git** | https://git-scm.com/ |
| **PuTTY** | https://www.putty.org/ |

---

## Summary Checklist

### ✅ Deployment Complete When:

- [ ] **AWS Infrastructure**
  - [ ] EC2 instance running (i-09660a6a27791808d)
  - [ ] Security group configured (sg-01fa7cd33889c744f)
  - [ ] Can SSH to instance

- [ ] **Kubernetes Cluster**
  - [ ] Node shows Ready status
  - [ ] All system pods running
  - [ ] kubectl commands work

- [ ] **Jenkins Setup**
  - [ ] Jenkins accessible at http://54.175.47.56:8080
  - [ ] Plugins installed
  - [ ] Credentials configured
  - [ ] Pipeline job created

- [ ] **Docker**
  - [ ] Image built successfully
  - [ ] Image pushed to Docker Hub
  - [ ] Image accessible: https://hub.docker.com/r/pranavtomar1/orgconnect

- [ ] **Application Deployed**
  - [ ] Pods running in orgconnect namespace
  - [ ] Services created
  - [ ] Application accessible: http://54.175.47.56:30080

- [ ] **CI/CD Pipeline**
  - [ ] Pipeline runs successfully
  - [ ] Automated deployment works
  - [ ] Blue-green switching functional

- [ ] **Zero Downtime Verified**
  - [ ] Traffic switch with no errors
  - [ ] Application stays available
  - [ ] Rollback tested

---

## Quick Reference Card

```
PROJECT: Blue-Green Deployment - OrgConnect
STUDENT: Pranav Tomar
DATE: November 2025

INFRASTRUCTURE
├─ AWS Account: 102382809436
├─ Region: us-east-1
├─ EC2 Instance: i-09660a6a27791808d (t3.small)
├─ Public IP: 54.175.47.56
├─ Private IP: 172.31.21.94
└─ Security Group: sg-01fa7cd33889c744f

APPLICATIONS
├─ OrgConnect: http://54.175.47.56:30080
├─ Jenkins: http://54.175.47.56:8080
├─ Health Check: http://54.175.47.56:30080/health
└─ GitHub: https://github.com/pranavtomar1/ORG_Connect

DOCKER
├─ Username: pranavtomar1
├─ Repository: pranavtomar1/orgconnect
├─ Docker Hub: https://hub.docker.com/r/pranavtomar1/orgconnect
└─ Current Tags: v1.0, latest

KUBERNETES
├─ Namespace: orgconnect
├─ Deployments: orgconnect-blue, orgconnect-green
├─ Services: orgconnect-active (NodePort: 30080)
└─ Version: v1.28.15

JENKINS
├─ Admin Password: f6671a1617a442f0ba72755950efde42
├─ Pipeline: orgconnect-pipeline
└─ Credentials: docker-credentials

COST
├─ Monthly: ~$18.40
├─ Daily: ~$0.61
└─ Duration on $100: ~5.4 months

QUICK COMMANDS
├─ Check pods: kubectl get pods -n orgconnect
├─ Check services: kubectl get svc -n orgconnect
├─ Switch to blue: kubectl patch service orgconnect-active -n orgconnect -p '{"spec":{"selector":{"version":"blue"}}}'
├─ Switch to green: kubectl patch service orgconnect-active -n orgconnect -p '{"spec":{"selector":{"version":"green"}}}'
└─ Scale deployment: kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=N
```

---

**🎉 Congratulations! Your Blue-Green Deployment System is Complete! 🎉**

**For questions or issues, refer to:**
- Troubleshooting section above
- Documentation: https://github.com/pranavtomar1/ORG_Connect/tree/main/docs
- Jenkins Setup: JENKINS-SETUP-FINAL.md

**Good luck with your college assignment! 🚀**

---

*Last Updated: November 6, 2025*  
*Version: 1.0*  
*Author: Pranav Tomar*

