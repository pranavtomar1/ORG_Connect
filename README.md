# OrgConnect - Blue-Green Deployment with Jenkins, Kubernetes & AWS

A complete automated blue-green deployment solution for the OrgConnect collaborative platform, demonstrating modern DevOps practices using Jenkins, Kubernetes, Docker, and AWS.

## 🚀 Project Overview

This project implements a **zero-downtime blue-green deployment strategy** for a React-based web application. It showcases enterprise-level CI/CD practices suitable for production environments while remaining cost-effective for educational purposes.

### Key Features

- ✅ **Automated CI/CD Pipeline** with Jenkins
- ✅ **Zero-Downtime Deployments** using Blue-Green strategy
- ✅ **Container Orchestration** with Kubernetes
- ✅ **Dockerized Application** with multi-stage builds
- ✅ **Cloud Infrastructure** on AWS
- ✅ **Health Checks & Auto-Rollback** mechanisms
- ✅ **Cost-Optimized** for AWS Free Tier ($100 credits)

## 📋 Table of Contents

- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Deployment Process](#deployment-process)
- [Cost Breakdown](#cost-breakdown)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          AWS Cloud                               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    EC2 Instance(s)                          │ │
│  │                                                              │ │
│  │  ┌───────────────────────────────────────────────────────┐ │ │
│  │  │            Kubernetes Cluster                         │ │ │
│  │  │                                                         │ │ │
│  │  │   ┌─────────────────┐     ┌─────────────────┐        │ │ │
│  │  │   │ Blue Deployment │     │ Green Deployment│        │ │ │
│  │  │   │   (Version 1)   │     │   (Version 2)   │        │ │ │
│  │  │   │   ┌─────────┐   │     │   ┌─────────┐   │        │ │ │
│  │  │   │   │ Pod │ Pod│   │     │   │ Pod │ Pod│   │        │ │ │
│  │  │   │   └─────────┘   │     │   └─────────┘   │        │ │ │
│  │  │   └────────┬────────┘     └────────┬────────┘        │ │ │
│  │  │            │                       │                  │ │ │
│  │  │            └───────────┬───────────┘                  │ │ │
│  │  │                        │                              │ │ │
│  │  │                 ┌──────▼──────┐                       │ │ │
│  │  │                 │   Active    │◄──── Traffic Switch   │ │ │
│  │  │                 │   Service   │                       │ │ │
│  │  │                 └──────┬──────┘                       │ │ │
│  │  │                        │                              │ │ │
│  │  │                  ┌─────▼─────┐                        │ │ │
│  │  │                  │  Ingress  │                        │ │ │
│  │  │                  └───────────┘                        │ │ │
│  │  └───────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌───────────────────────────────────────────────────────┐ │ │
│  │  │                  Jenkins Server                        │ │ │
│  │  │  • Build Docker Images                                 │ │ │
│  │  │  • Push to Registry                                    │ │ │
│  │  │  • Deploy to K8s                                       │ │ │
│  │  │  • Health Checks                                       │ │ │
│  │  │  • Traffic Switching                                   │ │ │
│  │  └───────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment Flow

1. **Developer** pushes code to Git repository
2. **Jenkins** detects change and triggers pipeline
3. **Docker** builds new container image
4. **Image** pushed to Docker Hub/ECR
5. **Kubernetes** deploys to inactive environment (Green if Blue is active)
6. **Health checks** verify new deployment
7. **Traffic switch** routes users to new version
8. **Old version** scaled down or kept for rollback

## 🛠️ Technologies Used

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | React + TypeScript | Web application |
| **Build Tool** | Vite | Fast development and building |
| **Containerization** | Docker | Application packaging |
| **Orchestration** | Kubernetes | Container management |
| **CI/CD** | Jenkins | Automation pipeline |
| **Cloud Provider** | AWS EC2 | Infrastructure hosting |
| **Web Server** | Nginx | Static file serving |
| **Version Control** | Git/GitHub | Source code management |

## 📦 Prerequisites

### Local Development:
- **Git** - Version control
- **Node.js** (v18+) - For local testing
- **Docker** (optional) - For local container builds
- **SSH Client** - To connect to AWS

### AWS Account:
- AWS account with $100 free tier credits
- Basic understanding of EC2, Security Groups

### Accounts:
- **GitHub** account - To host code
- **Docker Hub** account - To store images (free tier)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/org-connect.git
cd org-connect/ORG_Connect
```

### 2. Set Up AWS Infrastructure

Follow the detailed guide: [docs/AWS-SETUP.md](./docs/AWS-SETUP.md)

**Quick Summary:**
- Launch EC2 instance (Ubuntu 22.04, t3.medium)
- Configure security groups
- Connect via SSH

### 3. Install Required Components

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>

# Clone repository on EC2
git clone https://github.com/yourusername/org-connect.git
cd org-connect/ORG_Connect

# Make scripts executable
chmod +x scripts/*.sh

# Install Kubernetes (5-10 minutes)
sudo ./scripts/setup-k8s.sh

# Initialize cluster (5-10 minutes)
sudo ./scripts/init-cluster.sh

# Install Jenkins (5-10 minutes)
sudo ./scripts/jenkins-setup.sh
```

### 4. Configure Jenkins

```bash
# Get Jenkins initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Access Jenkins at: http://<EC2-PUBLIC-IP>:8080
```

Follow the detailed guide: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md#jenkins-configuration)

### 5. Deploy Application

**Option A: Manual Deployment (for first time)**

```bash
# Set your Docker Hub username
export DOCKER_IMAGE="pranavtomar1/orgconnect"
export IMAGE_TAG="v1.0"

# Build and push
docker build -t $DOCKER_IMAGE:$IMAGE_TAG .
docker login
docker push $DOCKER_IMAGE:$IMAGE_TAG

# Deploy using helper script
./scripts/deploy-app.sh
# Select: Option 1 (Deploy to Blue)
```

**Option B: Automated via Jenkins**

1. Create Pipeline job in Jenkins
2. Configure repository URL
3. Push code changes
4. Jenkins automatically builds and deploys

### 6. Access Your Application

```bash
# Get your application URL
echo "http://<EC2-PUBLIC-IP>:30080"
```

## 📁 Project Structure

```
ORG_Connect/
├── src/                          # React application source
│   ├── components/               # React components
│   ├── App.tsx                   # Main application
│   └── main.tsx                  # Entry point
├── k8s/                          # Kubernetes manifests
│   ├── namespace.yaml            # Namespace definition
│   ├── deployment-blue.yaml      # Blue environment
│   ├── deployment-green.yaml     # Green environment
│   ├── service-blue.yaml         # Blue service
│   ├── service-green.yaml        # Green service
│   ├── service-active.yaml       # Active service (traffic routing)
│   ├── ingress.yaml              # Ingress controller config
│   └── configmap.yaml            # Application configuration
├── scripts/                      # Automation scripts
│   ├── setup-k8s.sh             # Kubernetes installation
│   ├── init-cluster.sh          # Cluster initialization
│   ├── jenkins-setup.sh         # Jenkins installation
│   └── deploy-app.sh            # Manual deployment helper
├── docs/                         # Documentation
│   ├── AWS-SETUP.md             # AWS infrastructure guide
│   └── DEPLOYMENT.md            # Deployment guide
├── Dockerfile                    # Multi-stage Docker build
├── .dockerignore                # Docker build exclusions
├── Jenkinsfile                   # CI/CD pipeline definition
├── nginx.conf                    # Nginx configuration
└── README.md                     # This file
```

## 🔄 Deployment Process

### Blue-Green Deployment Explained

**Blue-Green deployment** is a strategy that reduces downtime and risk by running two identical production environments:

- **Blue** = Currently running version (production)
- **Green** = New version being deployed (staging)

### Step-by-Step Process:

1. **Initial State**: Blue environment serves v1.0
2. **Deploy New Version**: Green environment gets v2.0
3. **Test Green**: Health checks and smoke tests
4. **Switch Traffic**: Active service routes to Green
5. **Monitor**: Verify new version is stable
6. **Scale Down Blue**: Old version scaled down/removed
7. **Rollback Ready**: Blue can be quickly reactivated if issues occur

### Jenkins Pipeline Stages:

```
1. Checkout           → Get code from repository
2. Build              → Create Docker image
3. Push               → Upload to registry
4. Determine Active   → Check which env is current
5. Deploy to Target   → Deploy to inactive env
6. Health Check       → Verify new deployment
7. Approval           → Manual/auto approval
8. Switch Traffic     → Route to new version
9. Verify             → Post-deployment checks
10. Scale Down Old    → Clean up old version
```

## 💰 Cost Breakdown

### Minimal Setup (2-3 months on $100 credit)
- **EC2 t3.small**: ~$15/month
- **EBS Storage (30GB)**: ~$3/month
- **Data Transfer**: ~$2/month
- **Total**: ~$20/month

### Recommended Setup (2.5 months on $100 credit)
- **EC2 t3.medium**: ~$30/month
- **EBS Storage (30GB)**: ~$3/month
- **Data Transfer**: ~$2/month
- **Total**: ~$35/month

### Full Production Setup (2 months on $100 credit)
- **EC2 t3.medium**: ~$30/month
- **Application Load Balancer**: ~$16/month
- **EBS Storage**: ~$3/month
- **Data Transfer**: ~$3/month
- **Total**: ~$52/month

### Cost Optimization Tips:
- Stop instances when not in use
- Use spot instances for development
- Clean up unused resources
- Monitor with AWS Cost Explorer
- Set billing alerts

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [AWS-SETUP.md](./docs/AWS-SETUP.md) | Complete AWS infrastructure setup guide |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Detailed deployment and testing guide |
| [Jenkinsfile](./Jenkinsfile) | Jenkins pipeline configuration |
| [Dockerfile](./Dockerfile) | Docker image build instructions |

## 🧪 Testing

### Manual Testing

```bash
# Deploy to Blue
./scripts/deploy-app.sh
# Select: 1 (Deploy to Blue)

# Make visible change to code
# Update version in src/App.tsx

# Build new version
export IMAGE_TAG="v2.0"
docker build -t $DOCKER_IMAGE:$IMAGE_TAG .
docker push $DOCKER_IMAGE:$IMAGE_TAG

# Deploy to Green
./scripts/deploy-app.sh
# Select: 2 (Deploy to Green)

# Test both environments
./scripts/deploy-app.sh
# Select: 6 (Test health endpoints)

# Switch traffic to Green
./scripts/deploy-app.sh
# Select: 4 (Switch to Green)

# Verify application
curl http://<EC2-PUBLIC-IP>:30080
```

### Automated Testing via Jenkins

1. Make code change locally
2. Commit and push to GitHub
3. Jenkins automatically triggers
4. Monitor pipeline progress
5. Approve traffic switch when ready
6. Verify deployment success

### Health Check Verification

```bash
# Check Blue environment
kubectl run test-blue --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl http://orgconnect-blue.orgconnect.svc.cluster.local/health

# Check Green environment
kubectl run test-green --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl http://orgconnect-green.orgconnect.svc.cluster.local/health
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Pods Not Starting
```bash
kubectl get pods -n orgconnect
kubectl describe pod <pod-name> -n orgconnect
kubectl logs <pod-name> -n orgconnect
```

#### 2. Jenkins Build Fails
```bash
# Check Jenkins has Docker access
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Check Jenkins can access Kubernetes
sudo -u jenkins kubectl get nodes
```

#### 3. Cannot Access Application
```bash
# Verify service is running
kubectl get svc -n orgconnect

# Check security group allows port 30080
# AWS Console → EC2 → Security Groups

# Test from inside cluster
kubectl run test --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl http://orgconnect-active.orgconnect.svc.cluster.local
```

#### 4. Out of Memory/Resources
```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n orgconnect

# Scale down replicas
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=1
kubectl scale deployment/orgconnect-green -n orgconnect --replicas=1
```

More troubleshooting: [docs/DEPLOYMENT.md#troubleshooting](./docs/DEPLOYMENT.md#troubleshooting)

## 🎓 For College Assignment

### Demonstration Checklist

- [ ] Architecture diagram prepared
- [ ] AWS infrastructure running
- [ ] Kubernetes cluster operational
- [ ] Jenkins configured and running
- [ ] Blue environment deployed (v1)
- [ ] Make visible code change
- [ ] Trigger automated build
- [ ] Show Green deployment
- [ ] Demonstrate health checks
- [ ] Switch traffic (zero downtime)
- [ ] Show rollback capability
- [ ] Explain cost optimization

### Presentation Structure

1. **Introduction** (2 min)
   - Project overview
   - Technologies used
   - Architecture diagram

2. **Infrastructure** (3 min)
   - AWS setup
   - Kubernetes cluster
   - Jenkins configuration

3. **Live Demo** (8 min)
   - Show current deployment
   - Make code change
   - Trigger pipeline
   - Show parallel environments
   - Switch traffic
   - Demonstrate zero downtime

4. **Technical Deep Dive** (5 min)
   - Jenkinsfile walkthrough
   - Kubernetes manifests
   - Docker multi-stage build

5. **Challenges & Solutions** (2 min)
   - Problems encountered
   - How you solved them

6. **Q&A** (5 min)

## 🤝 Contributing

This is a college assignment project, but suggestions are welcome:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -m 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open Pull Request

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Project: College Assignment - DevOps & Cloud Computing

## 🙏 Acknowledgments

- Jenkins community for excellent CI/CD tools
- Kubernetes documentation and community
- AWS for free tier and educational credits
- React and Vite teams for modern web tooling

## 📞 Support

For issues and questions:
1. Check [Documentation](./docs/)
2. Review [Troubleshooting](./docs/DEPLOYMENT.md#troubleshooting)
3. Search existing GitHub issues
4. Create new issue with detailed description

---

## 🎯 Key Learning Outcomes

After completing this project, you will understand:

- ✅ **CI/CD Pipelines** - Automated build, test, and deployment
- ✅ **Containerization** - Docker best practices
- ✅ **Orchestration** - Kubernetes fundamentals
- ✅ **Cloud Infrastructure** - AWS EC2, networking, security
- ✅ **Deployment Strategies** - Blue-green deployment pattern
- ✅ **DevOps Practices** - Infrastructure as Code, automation
- ✅ **Cost Management** - Cloud cost optimization

---

**Happy Deploying! 🚀**

For detailed guides, see:
- [AWS Setup Guide](./docs/AWS-SETUP.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

