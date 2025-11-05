# Getting Started - Your First Steps

Welcome! This guide will help you understand and deploy your blue-green deployment project in the right order.

## 🎯 What You'll Accomplish

By following this guide, you'll:
- ✅ Set up AWS infrastructure
- ✅ Deploy a Kubernetes cluster
- ✅ Install Jenkins for CI/CD
- ✅ Deploy your application
- ✅ Perform zero-downtime blue-green deployments
- ✅ Learn industry-standard DevOps practices

**Time Required**: 1-2 hours for first-time setup

---

## 📖 Step-by-Step Guide

### Step 1: Understand the Project (15 minutes)

**Read These First:**
1. **[README.md](./README.md)** - Overview and features
2. **[PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)** - Technical details

**What to Look For:**
- Architecture diagram
- Technology stack
- Key features
- Cost breakdown

**Questions to Ask Yourself:**
- What is blue-green deployment?
- Why use Kubernetes?
- How does Jenkins help?
- What will this cost?

---

### Step 2: Prepare Prerequisites (30 minutes)

**Accounts You Need:**
1. **AWS Account**
   - Sign up at [aws.amazon.com](https://aws.amazon.com)
   - Apply student credits if available
   - Verify you have $100 credits

2. **Docker Hub Account**
   - Sign up at [hub.docker.com](https://hub.docker.com)
   - Create a repository named: `orgconnect`
   - Note your username

3. **GitHub Account**
   - Fork or clone this repository
   - Ensure you can push to it

**Local Setup:**
- Install Git
- Install SSH client
- Have a text editor ready
- Optional: Install Docker locally for testing

**Checklist:**
- [ ] AWS account ready
- [ ] Docker Hub account created
- [ ] GitHub repository accessible
- [ ] Git installed locally
- [ ] SSH client available

---

### Step 3: AWS Infrastructure Setup (45 minutes)

**📚 Follow: [docs/AWS-SETUP.md](./docs/AWS-SETUP.md)**

**Summary of Steps:**
1. Launch EC2 instance (Ubuntu 22.04, t3.medium)
2. Configure security groups (ports: 22, 80, 8080, 30080)
3. Connect via SSH
4. Note your EC2 public IP

**Commands You'll Use:**
```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

**Verification:**
```bash
# You should be logged into Ubuntu
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

**Common Issues:**
- Can't connect via SSH? Check security group allows port 22
- Connection timeout? Verify instance is running
- Permission denied? Check key file permissions: `chmod 400 your-key.pem`

---

### Step 4: Install Kubernetes (20 minutes)

**On Your EC2 Instance:**

```bash
# Clone the repository
git clone https://github.com/yourusername/org-connect.git
cd org-connect/ORG_Connect

# Make scripts executable
chmod +x scripts/*.sh

# Install Kubernetes components
sudo ./scripts/setup-k8s.sh
```

**What This Does:**
- Installs kubeadm, kubelet, kubectl
- Configures container runtime (containerd)
- Sets up required kernel modules
- Configures network settings

**Time**: 5-10 minutes

**Verification:**
```bash
kubeadm version
kubectl version --client
```

---

### Step 5: Initialize Kubernetes Cluster (20 minutes)

```bash
# Initialize the cluster
sudo ./scripts/init-cluster.sh
```

**What This Does:**
- Initializes Kubernetes control plane
- Installs Flannel network plugin
- Installs NGINX Ingress controller
- Installs Metrics Server
- Configures kubectl access

**Time**: 5-10 minutes

**Verification:**
```bash
kubectl get nodes
# Should show: Ready

kubectl get pods --all-namespaces
# Should show: All pods Running
```

---

### Step 6: Install Jenkins (20 minutes)

```bash
# Install Jenkins
sudo ./scripts/jenkins-setup.sh
```

**What This Does:**
- Installs Java
- Installs Docker
- Installs Jenkins
- Configures Jenkins user permissions
- Copies kubeconfig for Jenkins

**Time**: 5-10 minutes

**Get Initial Password:**
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Verification:**
```bash
sudo systemctl status jenkins
# Should show: active (running)
```

**Access Jenkins:**
- Open browser: `http://<EC2-PUBLIC-IP>:8080`
- Enter initial admin password
- Install suggested plugins
- Create admin user

---

### Step 7: Configure Jenkins (15 minutes)

**📚 Follow: [docs/DEPLOYMENT.md#jenkins-configuration](./docs/DEPLOYMENT.md#jenkins-configuration)**

**Summary:**

1. **Install Required Plugins:**
   - Docker Pipeline
   - Kubernetes CLI
   - Git
   - Credentials Binding

2. **Add Credentials:**
   
   **Docker Hub Credentials:**
   - ID: `docker-credentials`
   - Type: Username with password
   - Enter your Docker Hub username/password

   **Docker Image Name:**
   - ID: `docker-image-name`
   - Type: Secret text
   - Value: `yourusername/orgconnect`

   **Kubeconfig:**
   - ID: `kubeconfig`
   - Type: Secret file
   - File: Copy from `/var/lib/jenkins/.kube/config`

3. **Create Pipeline Job:**
   - Name: `orgconnect-pipeline`
   - Type: Pipeline
   - SCM: Git
   - Repository URL: Your GitHub URL
   - Script Path: `Jenkinsfile`

**Verification:**
- Jenkins dashboard loads
- Credentials added successfully
- Pipeline job created

---

### Step 8: Update Configuration (10 minutes)

**Edit Jenkinsfile:**
```bash
nano Jenkinsfile
```

**Change Line 8:**
```groovy
DOCKER_IMAGE = 'yourusername/orgconnect'  // Change to your Docker Hub username
```

**Commit and Push:**
```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
git add Jenkinsfile
git commit -m "Update Docker image name"
git push origin main
```

---

### Step 9: First Deployment (20 minutes)

**Option A: Manual Deployment (Recommended First Time)**

```bash
# On EC2 instance
export DOCKER_IMAGE="pranavtomar1/orgconnect"
export IMAGE_TAG="v1.0"

# Build Docker image
docker build -t $DOCKER_IMAGE:$IMAGE_TAG .

# Login to Docker Hub
docker login
# Enter your credentials

# Push image
docker push $DOCKER_IMAGE:$IMAGE_TAG
docker tag $DOCKER_IMAGE:$IMAGE_TAG $DOCKER_IMAGE:latest
docker push $DOCKER_IMAGE:latest

# Deploy using helper script
./scripts/deploy-app.sh
```

**In the Menu:**
1. Select option `1` - Deploy to Blue environment
2. Wait for deployment to complete
3. Select option `3` - Switch traffic to Blue
4. Select option `5` - Show current status

**Verification:**
```bash
kubectl get pods -n orgconnect
# Should show: 2 pods Running

kubectl get svc -n orgconnect
# Should show: Services created
```

**Access Your Application:**
```bash
echo "http://<EC2-PUBLIC-IP>:30080"
```

Open this URL in your browser - you should see your application!

---

### Step 10: Test Blue-Green Deployment (30 minutes)

**Now for the exciting part!**

#### 10.1: Make a Visible Change

**On Your Local Machine:**

Edit `src/App.tsx`:
```typescript
// Find the title and change it
<h1>OrgConnect v2.0</h1>  // Add version number
```

**Commit and Push:**
```bash
git add src/App.tsx
git commit -m "Update to version 2.0"
git push origin main
```

#### 10.2: Trigger Deployment

**Option A: Automatic (if polling is enabled)**
- Wait up to 5 minutes for Jenkins to detect change
- Watch Jenkins dashboard

**Option B: Manual Trigger**
- Go to Jenkins dashboard
- Click on `orgconnect-pipeline`
- Click "Build Now"

#### 10.3: Watch the Magic

**Monitor in Jenkins:**
1. ✓ Checkout
2. ✓ Build Docker Image
3. ✓ Push to Registry
4. ✓ Determine Active (finds Blue is active)
5. ✓ Deploy to Green
6. ✓ Health Check
7. ⏸️ Approval (click "Proceed")
8. ✓ Switch Traffic
9. ✓ Verify
10. ✓ Scale Down Old

**Watch in Terminal:**
```bash
# Watch pods being created
watch kubectl get pods -n orgconnect

# Check active service
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector.version}'
```

#### 10.4: Verify Zero Downtime

**In Browser:**
- Keep application open
- Refresh during deployment
- Notice no errors or downtime
- See new version appear after switch

**Success!** You've just performed a zero-downtime blue-green deployment!

---

## 🎉 You're Done!

### What You've Accomplished

✅ Set up complete AWS infrastructure
✅ Deployed Kubernetes cluster
✅ Installed and configured Jenkins
✅ Deployed your application
✅ Performed blue-green deployment
✅ Achieved zero-downtime updates
✅ Learned industry-standard DevOps practices

---

## 🎓 Next Steps

### For Learning
1. Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Understand the design
2. Study [Jenkinsfile](./Jenkinsfile) - Learn the pipeline
3. Review Kubernetes manifests in `k8s/` directory
4. Experiment with manual commands in `deploy-app.sh`

### For Assignment
1. Read [docs/PRESENTATION-GUIDE.md](./docs/PRESENTATION-GUIDE.md)
2. Prepare your presentation
3. Practice the demo
4. Prepare to answer questions

### For Troubleshooting
1. Check [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
2. Run diagnostics: `kubectl get all -n orgconnect`
3. Check logs: `kubectl logs <pod-name> -n orgconnect`
4. Ask for help with specific error messages

---

## 📊 Quick Reference

### Useful Commands

```bash
# Check everything
kubectl get all -n orgconnect

# Check pods
kubectl get pods -n orgconnect

# Check services
kubectl get svc -n orgconnect

# Check active environment
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector.version}'

# Access application
echo "http://<EC2-IP>:30080"

# Check Jenkins
sudo systemctl status jenkins

# View logs
kubectl logs <pod-name> -n orgconnect
```

### Helper Script Menu

```bash
./scripts/deploy-app.sh

Options:
1) Deploy to Blue
2) Deploy to Green
3) Switch to Blue
4) Switch to Green
5) Show status
6) Test health
7) Scale deployment
8) Rollback
9) Clean up
0) Exit
```

### Important URLs

```
Application:  http://<EC2-IP>:30080
Jenkins:      http://<EC2-IP>:8080
Health Check: http://<EC2-IP>:30080/health
```

---

## 💡 Pro Tips

### Save Money
- Stop EC2 instance when not using (AWS Console → EC2 → Stop)
- Start it when needed (takes 1-2 minutes)
- You only pay for storage when stopped (~$3/month)

### Test Locally First
- Build Docker image locally: `docker build -t test .`
- Run locally: `docker run -p 8080:80 test`
- Test at: `http://localhost:8080`

### Make Small Changes
- Test with visible changes (titles, colors)
- One change at a time
- Commit frequently

### Keep Backups
- Take screenshots of working system
- Export configurations: `kubectl get all -n orgconnect -o yaml > backup.yaml`
- Keep notes of any custom configurations

---

## 🆘 Need Help?

### If Something Breaks

1. **Don't Panic!** Most issues are simple fixes.

2. **Check Status:**
   ```bash
   kubectl get pods -n orgconnect
   kubectl get nodes
   sudo systemctl status jenkins
   ```

3. **Check Logs:**
   ```bash
   kubectl logs <pod-name> -n orgconnect
   sudo journalctl -u jenkins -n 50
   ```

4. **Quick Fixes:**
   - Pods not starting? Check `kubectl describe pod <pod-name> -n orgconnect`
   - Out of memory? Scale down: `kubectl scale deployment/orgconnect-green -n orgconnect --replicas=0`
   - Jenkins issues? Restart: `sudo systemctl restart jenkins`

5. **Nuclear Option:**
   ```bash
   # Delete everything and start over
   kubectl delete namespace orgconnect
   ./scripts/deploy-app.sh  # Redeploy
   ```

---

## 📚 Documentation Map

**Start Here:**
- [GETTING-STARTED.md](./GETTING-STARTED.md) ← You are here
- [QUICKSTART.md](./QUICKSTART.md) - Fast reference

**Setup:**
- [docs/AWS-SETUP.md](./docs/AWS-SETUP.md) - Infrastructure
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment steps

**Understanding:**
- [README.md](./README.md) - Overview
- [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) - Complete details
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Technical design

**Help:**
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Fix issues
- [docs/PRESENTATION-GUIDE.md](./docs/PRESENTATION-GUIDE.md) - Present your work

---

## ✅ Final Checklist

Before considering yourself done:

- [ ] Application accessible in browser
- [ ] Both Blue and Green deployments work
- [ ] Traffic switching successful
- [ ] No downtime observed
- [ ] Rollback tested and working
- [ ] Jenkins pipeline completes successfully
- [ ] Can explain how it works
- [ ] Documentation reviewed
- [ ] Presentation prepared (if needed)
- [ ] Screenshots/videos captured

---

**Congratulations! You've built a production-grade blue-green deployment system! 🚀**

**Remember:** This is not just a project - it's a valuable skill that companies actively look for in DevOps engineers.

**Share Your Success:**
- Add to your resume
- Post on LinkedIn
- Share on GitHub
- Use in interviews

---

**Questions? Issues? Stuck?**

1. Re-read this guide carefully
2. Check the troubleshooting guide
3. Review documentation
4. Search error messages online
5. Ask for help with specific details

**You've got this! Happy deploying! 🎉**

