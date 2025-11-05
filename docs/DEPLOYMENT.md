# Deployment Guide

Complete guide for deploying OrgConnect using the blue-green deployment strategy with Jenkins, Kubernetes, Docker, and AWS.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Jenkins Configuration](#jenkins-configuration)
5. [First Deployment](#first-deployment)
6. [Blue-Green Deployment Process](#blue-green-deployment-process)
7. [Testing and Verification](#testing-and-verification)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  EC2 Instance(s)                       │  │
│  │  ┌──────────────────────────────────────────────┐     │  │
│  │  │           Kubernetes Cluster                 │     │  │
│  │  │  ┌────────────┐      ┌────────────┐         │     │  │
│  │  │  │   Blue     │      │   Green    │         │     │  │
│  │  │  │ Deployment │      │ Deployment │         │     │  │
│  │  │  │  (v1.0)    │      │  (v2.0)    │         │     │  │
│  │  │  └─────┬──────┘      └──────┬─────┘         │     │  │
│  │  │        │                    │               │     │  │
│  │  │  ┌─────▼────────────────────▼─────┐         │     │  │
│  │  │  │     Active Service             │         │     │  │
│  │  │  │  (Routes to Blue or Green)     │         │     │  │
│  │  │  └────────────┬───────────────────┘         │     │  │
│  │  │               │                             │     │  │
│  │  │         ┌─────▼──────┐                      │     │  │
│  │  │         │  Ingress   │                      │     │  │
│  │  │         └────────────┘                      │     │  │
│  │  └──────────────────────────────────────────────┘     │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐     │  │
│  │  │              Jenkins Server                  │     │  │
│  │  │  - CI/CD Pipeline                            │     │  │
│  │  │  - Docker Build                              │     │  │
│  │  │  - Kubernetes Deploy                         │     │  │
│  │  └──────────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Flow

1. **Code Push** → Developer pushes code to Git repository
2. **Jenkins Trigger** → Jenkins detects change and starts pipeline
3. **Build** → Docker image is built
4. **Push** → Image pushed to Docker Hub/ECR
5. **Deploy to Inactive** → Deploy to non-active environment (Green if Blue is active)
6. **Health Check** → Verify new deployment is healthy
7. **Switch Traffic** → Update service selector to route to new version
8. **Scale Down Old** → Scale down or remove old version

---

## Prerequisites

### On Your Local Machine:
- Git installed
- Docker Hub account (free)
- SSH client
- Code editor

### On AWS:
- EC2 instance(s) running Ubuntu 22.04
- Security groups configured (see AWS-SETUP.md)
- SSH access to instances

---

## Initial Setup

### Step 1: Prepare Your Repository

1. **Create Docker Hub Account**
   ```bash
   # Go to https://hub.docker.com and sign up
   # Create a repository: orgconnect
   ```

2. **Update Configuration Files**
   
   In `Jenkinsfile`, update the Docker image name:
   ```groovy
   DOCKER_IMAGE = 'yourusername/orgconnect'  // Replace with your Docker Hub username
   ```

3. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Add blue-green deployment configuration"
   git push origin main
   ```

### Step 2: Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### Step 3: Clone Repository

```bash
cd ~
git clone https://github.com/yourusername/org-connect.git
cd org-connect/ORG_Connect
```

### Step 4: Run Setup Scripts

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Install Kubernetes components
sudo ./scripts/setup-k8s.sh
# This takes ~5-10 minutes

# Initialize Kubernetes cluster
sudo ./scripts/init-cluster.sh
# This takes ~5-10 minutes

# Install Jenkins
sudo ./scripts/jenkins-setup.sh
# This takes ~5-10 minutes
```

### Step 5: Verify Installation

```bash
# Check Kubernetes
kubectl get nodes
kubectl get pods --all-namespaces

# Check Jenkins
sudo systemctl status jenkins

# Get Jenkins initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

---

## Jenkins Configuration

### Step 1: Access Jenkins

1. Open browser: `http://<EC2-PUBLIC-IP>:8080`
2. Enter initial admin password
3. Click "Install suggested plugins"
4. Create admin user

### Step 2: Install Required Plugins

1. Go to **Manage Jenkins** → **Manage Plugins**
2. Go to **Available** tab
3. Search and install:
   - **Docker Pipeline**
   - **Kubernetes CLI**
   - **Git**
   - **Pipeline**
   - **Credentials Binding**
4. Restart Jenkins

### Step 3: Configure Credentials

#### Docker Hub Credentials:

1. **Manage Jenkins** → **Manage Credentials**
2. Click **(global)** → **Add Credentials**
3. Configure:
   - **Kind:** Username with password
   - **Username:** Your Docker Hub username
   - **Password:** Your Docker Hub password
   - **ID:** `docker-credentials`
   - **Description:** Docker Hub Credentials
4. Click **Create**

#### Docker Image Name:

1. **Add Credentials** again
2. Configure:
   - **Kind:** Secret text
   - **Secret:** `yourusername/orgconnect` (your Docker Hub repo)
   - **ID:** `docker-image-name`
   - **Description:** Docker Image Name
3. Click **Create**

#### Kubeconfig:

1. On EC2 instance, get kubeconfig content:
   ```bash
   cat ~/.kube/config
   ```

2. In Jenkins, **Add Credentials**:
   - **Kind:** Secret file
   - **File:** Upload your kubeconfig or paste content
   - **ID:** `kubeconfig`
   - **Description:** Kubernetes Config
3. Click **Create**

### Step 4: Create Jenkins Pipeline Job

1. **Dashboard** → **New Item**
2. Enter name: `orgconnect-pipeline`
3. Select **Pipeline**
4. Click **OK**

5. Configure the job:
   - **General:**
     - Description: "Blue-Green deployment pipeline for OrgConnect"
   
   - **Build Triggers:**
     - ☑ Poll SCM: `H/5 * * * *` (checks every 5 minutes)
     - Or use GitHub webhooks for instant triggers
   
   - **Pipeline:**
     - **Definition:** Pipeline script from SCM
     - **SCM:** Git
     - **Repository URL:** Your GitHub repo URL
     - **Branch:** `*/main` or `*/master`
     - **Script Path:** `Jenkinsfile`

6. Click **Save**

---

## First Deployment

### Manual Deployment (Recommended First Time)

This helps verify everything works before using Jenkins:

```bash
# On EC2 instance
cd ~/org-connect/ORG_Connect

# Export variables
export DOCKER_IMAGE="yourusername/orgconnect"
export IMAGE_TAG="v1.0"

# Build Docker image locally
docker build -t $DOCKER_IMAGE:$IMAGE_TAG .

# Tag as latest
docker tag $DOCKER_IMAGE:$IMAGE_TAG $DOCKER_IMAGE:latest

# Login to Docker Hub
docker login

# Push image
docker push $DOCKER_IMAGE:$IMAGE_TAG
docker push $DOCKER_IMAGE:latest

# Use deployment script
./scripts/deploy-app.sh
# Select option 1 (Deploy to Blue environment)
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n orgconnect

# Check services
kubectl get svc -n orgconnect

# Test application
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
curl http://$NODE_IP:30080/health

# Or in browser
echo "Access at: http://<EC2-PUBLIC-IP>:30080"
```

---

## Blue-Green Deployment Process

### Scenario: Deploying Version 2

Let's say Blue is currently serving v1.0 and you want to deploy v2.0:

#### Step 1: Make Changes to Code

```bash
# On your local machine
# Edit src/App.tsx or any file
# Commit and push
git add .
git commit -m "Update to v2.0"
git push origin main
```

#### Step 2: Trigger Jenkins Build

- **Option A:** Wait for poll trigger (up to 5 minutes)
- **Option B:** Manually trigger: Jenkins → orgconnect-pipeline → Build Now

#### Step 3: Monitor Pipeline

Watch the Jenkins console output:
1. ✓ Checkout
2. ✓ Build Docker Image
3. ✓ Push to Registry
4. ✓ Determine Active Environment (finds Blue is active)
5. ✓ Deploy to Target Environment (deploys to Green)
6. ✓ Health Check on Target (verifies Green is healthy)
7. ⏸️ Approval (manual step - you approve)
8. ✓ Switch Traffic (routes traffic to Green)
9. ✓ Post-Deployment Verification
10. ✓ Scale Down Old Environment (scales down Blue)

#### Step 4: Verify Switch

```bash
# On EC2 instance
kubectl get svc orgconnect-active -n orgconnect -o wide

# Should show version: green

# Test application
curl http://<EC2-PUBLIC-IP>:30080
```

#### Step 5: Rollback if Needed

If something goes wrong:

**Option A: Use Jenkins**
- The pipeline will automatically rollback on failure

**Option B: Manual Rollback**
```bash
# Switch traffic back to Blue
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"blue"}}}'

# Scale up Blue if needed
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=2
```

---

## Testing and Verification

### Test Blue-Green Switch

1. **Deploy to Blue:**
   ```bash
   ./scripts/deploy-app.sh
   # Choose option 1
   ```

2. **Switch to Blue:**
   ```bash
   ./scripts/deploy-app.sh
   # Choose option 3
   ```

3. **Deploy to Green:**
   ```bash
   # Update code with visible change
   # e.g., change title in src/App.tsx
   
   export IMAGE_TAG="v2.0"
   docker build -t $DOCKER_IMAGE:$IMAGE_TAG .
   docker push $DOCKER_IMAGE:$IMAGE_TAG
   
   ./scripts/deploy-app.sh
   # Choose option 2
   ```

4. **Test Green Before Switching:**
   ```bash
   kubectl run test-green --image=curlimages/curl:latest \
     --restart=Never -n orgconnect --rm -i \
     -- curl http://orgconnect-green.orgconnect.svc.cluster.local
   ```

5. **Switch to Green:**
   ```bash
   ./scripts/deploy-app.sh
   # Choose option 4
   ```

6. **Verify Zero Downtime:**
   ```bash
   # In one terminal, continuously ping the app
   while true; do
     curl -s http://<EC2-PUBLIC-IP>:30080/health
     sleep 1
   done
   
   # In another terminal, perform the switch
   # You should see no failed requests
   ```

### Health Check Tests

```bash
# Test Blue health
kubectl run test-blue --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl http://orgconnect-blue.orgconnect.svc.cluster.local/health

# Test Green health
kubectl run test-green --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl http://orgconnect-green.orgconnect.svc.cluster.local/health

# Test Active service
kubectl run test-active --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl http://orgconnect-active.orgconnect.svc.cluster.local/health
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n orgconnect

# Get pod details
kubectl describe pod <pod-name> -n orgconnect

# Check logs
kubectl logs <pod-name> -n orgconnect

# Common issues:
# - Image pull error: Check Docker Hub credentials
# - CrashLoopBackOff: Check application logs
# - Pending: Check node resources (kubectl describe node)
```

### Jenkins Build Failing

```bash
# On EC2 instance, check Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# Check if Jenkins can access Docker
sudo -u jenkins docker ps

# If not, add Jenkins to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Check kubectl access
sudo -u jenkins kubectl get nodes
```

### Cannot Access Application

```bash
# Check if service is running
kubectl get svc -n orgconnect

# Check NodePort
kubectl get svc orgconnect-active -n orgconnect

# Check security group allows port 30080

# Check if pods are running
kubectl get pods -n orgconnect

# Test from within cluster
kubectl run test --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl http://orgconnect-active.orgconnect.svc.cluster.local
```

### Traffic Not Switching

```bash
# Check current active version
kubectl get svc orgconnect-active -n orgconnect \
  -o jsonpath='{.spec.selector.version}'

# Manually switch
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"green"}}}'

# Verify
kubectl describe svc orgconnect-active -n orgconnect
```

### Out of Resources

```bash
# Check node resources
kubectl top nodes
kubectl top pods -n orgconnect

# Reduce replica count
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=1
kubectl scale deployment/orgconnect-green -n orgconnect --replicas=1

# Reduce resource limits in deployment YAML
```

---

## Best Practices

1. **Always test in Green before switching**
2. **Keep Blue running until Green is verified**
3. **Monitor application metrics during switch**
4. **Have a rollback plan ready**
5. **Use meaningful image tags (not just 'latest')**
6. **Document deployment times and versions**
7. **Test rollback procedure regularly**

---

## Next Steps for College Assignment

### Demonstration Checklist:

- [ ] Show Kubernetes cluster running
- [ ] Show Jenkins pipeline configuration
- [ ] Trigger a build from code change
- [ ] Show Blue environment serving v1
- [ ] Deploy v2 to Green environment
- [ ] Show both environments running simultaneously
- [ ] Perform health checks on Green
- [ ] Switch traffic from Blue to Green
- [ ] Demonstrate zero downtime
- [ ] Show rollback capability
- [ ] Explain cost optimization strategies

### Presentation Tips:

1. **Before Class:**
   - Prepare slides with architecture diagram
   - Have v1 deployed to Blue
   - Test everything once
   - Prepare v2 code changes (simple, visible change)

2. **During Demo:**
   - Show Jenkins dashboard
   - Make a visible code change (e.g., change app title)
   - Push code and show pipeline trigger
   - Show parallel deployments
   - Demonstrate traffic switch
   - Show monitoring/logs

3. **Documentation:**
   - Architecture diagram
   - Cost breakdown
   - Lessons learned
   - Challenges faced

---

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Documentation](https://docs.docker.com/)
- [Blue-Green Deployment Pattern](https://martinfowler.com/bliki/BlueGreenDeployment.html)

