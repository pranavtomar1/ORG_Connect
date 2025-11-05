# Quick Start Guide

Fast track guide to get your blue-green deployment running in under 30 minutes.

## Prerequisites Checklist

- [ ] AWS account with $100 credits
- [ ] Docker Hub account (free)
- [ ] GitHub account
- [ ] SSH key pair for AWS

## Step 1: AWS Setup (5 minutes)

1. **Launch EC2 Instance:**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t3.medium
   - Storage: 30GB gp3
   - Security Group: Allow ports 22, 80, 8080, 30000-32767

2. **Get Instance IP:**
   ```bash
   # Note your EC2 public IP
   EC2_IP="<your-ec2-public-ip>"
   ```

## Step 2: Connect and Setup (15 minutes)

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@$EC2_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Clone repository
git clone https://github.com/yourusername/org-connect.git
cd org-connect/ORG_Connect

# Make scripts executable
chmod +x scripts/*.sh

# Run setup scripts (each takes 5-10 minutes)
sudo ./scripts/setup-k8s.sh
sudo ./scripts/init-cluster.sh
sudo ./scripts/jenkins-setup.sh
```

## Step 3: Configure Jenkins (5 minutes)

1. **Get Jenkins Password:**
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```

2. **Access Jenkins:**
   - URL: `http://<EC2-IP>:8080`
   - Install suggested plugins
   - Create admin user

3. **Add Credentials:**
   - Go to: Manage Jenkins → Manage Credentials
   - Add Docker Hub credentials (ID: `docker-credentials`)
   - Add Docker image name (ID: `docker-image-name`, Value: `yourusername/orgconnect`)

4. **Create Pipeline Job:**
   - New Item → Pipeline
   - SCM: Git
   - Repository: Your GitHub URL
   - Script Path: `Jenkinsfile`

## Step 4: First Deployment (5 minutes)

```bash
# On EC2 instance
export DOCKER_IMAGE="pranavtomar1/orgconnect"
export IMAGE_TAG="v1.0"

# Build and push image
docker build -t $DOCKER_IMAGE:$IMAGE_TAG .
docker login  # Enter Docker Hub credentials
docker push $DOCKER_IMAGE:$IMAGE_TAG

# Deploy to Blue environment
./scripts/deploy-app.sh
# Select: 1 (Deploy to Blue)
# Then: 3 (Switch traffic to Blue)
```

## Step 5: Access Application

```bash
# Get NodePort URL
echo "Application URL: http://$EC2_IP:30080"
```

Open in browser: `http://<EC2-IP>:30080`

## Step 6: Test Blue-Green Deployment

1. **Make a visible change:**
   ```bash
   # On your local machine
   # Edit src/App.tsx - change the title
   git add .
   git commit -m "Update to v2.0"
   git push origin main
   ```

2. **Jenkins will automatically:**
   - Build new image
   - Deploy to Green
   - Wait for approval
   - Switch traffic

3. **Or deploy manually:**
   ```bash
   # On EC2
   export IMAGE_TAG="v2.0"
   docker build -t $DOCKER_IMAGE:$IMAGE_TAG .
   docker push $DOCKER_IMAGE:$IMAGE_TAG
   
   ./scripts/deploy-app.sh
   # Select: 2 (Deploy to Green)
   # Then: 4 (Switch traffic to Green)
   ```

## Verification Commands

```bash
# Check Kubernetes
kubectl get nodes
kubectl get pods -n orgconnect
kubectl get svc -n orgconnect

# Check which environment is active
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector.version}'

# Test health endpoints
curl http://$EC2_IP:30080/health

# Check Jenkins
sudo systemctl status jenkins
```

## Common Issues & Quick Fixes

### Issue: Pods not starting
```bash
kubectl describe pod <pod-name> -n orgconnect
kubectl logs <pod-name> -n orgconnect
```

### Issue: Jenkins can't access Docker
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: Can't access application
```bash
# Check security group allows port 30080
# Check pods are running
kubectl get pods -n orgconnect
```

### Issue: Out of memory
```bash
# Reduce replicas
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=1
kubectl scale deployment/orgconnect-green -n orgconnect --replicas=1
```

## Useful Commands

```bash
# View all resources
kubectl get all -n orgconnect

# Check logs
kubectl logs -f deployment/orgconnect-blue -n orgconnect
kubectl logs -f deployment/orgconnect-green -n orgconnect

# Scale deployment
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=2

# Delete everything
kubectl delete namespace orgconnect

# Restart Jenkins
sudo systemctl restart jenkins

# View Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log
```

## Helper Script Menu

The `deploy-app.sh` script provides:
1. Deploy to Blue environment
2. Deploy to Green environment
3. Switch traffic to Blue
4. Switch traffic to Green
5. Show current status
6. Test health endpoints
7. Scale deployment
8. Rollback to previous version
9. Clean up all resources

## Cost Saving Tips

```bash
# Stop instance when not using
aws ec2 stop-instances --instance-ids <instance-id>

# Start when needed
aws ec2 start-instances --instance-ids <instance-id>
```

**Note:** Stopping saves ~90% of costs (only pay for storage)

## Next Steps

- [ ] Read full [README.md](./README.md)
- [ ] Review [AWS-SETUP.md](./docs/AWS-SETUP.md) for details
- [ ] Study [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for advanced topics
- [ ] Prepare presentation for college

## Emergency Rollback

If something goes wrong:

```bash
# Quick rollback to Blue
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"blue"}}}'

# Scale up Blue if needed
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=2
```

## Getting Help

1. Check error logs
2. Review documentation in `docs/`
3. Search GitHub issues
4. Check AWS CloudWatch logs

---

**Estimated Total Time:** 30-40 minutes
**Estimated Cost:** ~$35/month (runs for 2.5 months on $100 credit)

Good luck with your assignment! 🚀

