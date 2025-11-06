# Quick Reference Card - Blue-Green Deployment

**Project:** OrgConnect Collaborative Platform  
**Student:** Pranav Tomar  
**Date:** November 2025

---

## 🔗 Essential URLs

| Resource | URL |
|----------|-----|
| **Application** | http://54.175.47.56:30080 |
| **Health Check** | http://54.175.47.56:30080/health |
| **Jenkins** | http://54.175.47.56:8080 |
| **GitHub Repo** | https://github.com/pranavtomar1/ORG_Connect |
| **Docker Hub** | https://hub.docker.com/r/pranavtomar1/orgconnect |
| **AWS Console** | https://us-east-1.console.aws.amazon.com/ |
| **EC2 Instances** | https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#Instances: |
| **Jenkins Pipeline** | http://54.175.47.56:8080/job/orgconnect-pipeline/ |

---

## 📊 System Information

| Component | Details |
|-----------|---------|
| **AWS Account** | 102382809436 |
| **Region** | us-east-1 (N. Virginia) |
| **Instance ID** | i-09660a6a27791808d |
| **Instance Type** | t3.small (2 vCPU, 2GB RAM) |
| **Public IP** | 54.175.47.56 |
| **Private IP** | 172.31.21.94 |
| **Security Group** | sg-01fa7cd33889c744f |
| **Key Pair** | orgconnect-key |

---

## 🐳 Docker Information

| Item | Value |
|------|-------|
| **Username** | pranavtomar1 |
| **Repository** | pranavtomar1/orgconnect |
| **Image Tags** | v1.0, latest |
| **Credential ID** | docker-credentials |

---

## ☸️ Kubernetes Information

| Item | Value |
|------|-------|
| **Version** | v1.28.15 |
| **Namespace** | orgconnect |
| **Deployments** | orgconnect-blue, orgconnect-green |
| **Services** | orgconnect-blue, orgconnect-green, orgconnect-active |
| **NodePort** | 30080 |
| **Container Runtime** | containerd |
| **Network Plugin** | Flannel |
| **Ingress** | NGINX v1.8.1 |

---

## 🔐 Jenkins Information

| Item | Value |
|------|-------|
| **URL** | http://54.175.47.56:8080 |
| **Initial Password** | f6671a1617a442f0ba72755950efde42 |
| **Pipeline Name** | orgconnect-pipeline |
| **Credentials** | docker-credentials |
| **Poll Schedule** | H/5 * * * * (every 5 min) |

---

## 💰 Cost Information

| Item | Cost |
|------|------|
| **EC2 t3.small** | ~$15.00/month |
| **EBS 30GB gp3** | ~$2.40/month |
| **Data Transfer** | ~$1.00/month |
| **Total Monthly** | ~$18.40 |
| **Daily Cost** | ~$0.61 |
| **Duration on $100** | ~5.4 months |

---

## ⚡ Quick Commands

### Connect to EC2
```bash
ssh -i orgconnect-key.pem ubuntu@54.175.47.56
```

### Check Kubernetes Status
```bash
kubectl get nodes
kubectl get pods -n orgconnect
kubectl get svc -n orgconnect
kubectl get all -n orgconnect
```

### Check Active Environment
```bash
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector.version}'
```

### Switch to Blue
```bash
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"blue"}}}'
```

### Switch to Green
```bash
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"green"}}}'
```

### Scale Deployment
```bash
# Scale up
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=2

# Scale down
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=0
```

### Check Pod Logs
```bash
kubectl logs <pod-name> -n orgconnect
kubectl logs <pod-name> -n orgconnect --previous
```

### Docker Commands
```bash
# Build image
docker build -t pranavtomar1/orgconnect:v1.0 .

# Push image
docker push pranavtomar1/orgconnect:v1.0

# Login
docker login
```

### Jenkins Commands
```bash
# Check status
sudo systemctl status jenkins

# Restart
sudo systemctl restart jenkins

# View logs
sudo tail -f /var/log/jenkins/jenkins.log

# Get password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Health Checks
```bash
# Application health
curl http://54.175.47.56:30080/health

# Continuous monitoring
while true; do
  curl -s http://54.175.47.56:30080/health
  sleep 1
done
```

---

## 🚨 Emergency Rollback

```bash
# Quick rollback to Blue
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"blue"}}}'

kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=2
```

**Rollback Time:** < 30 seconds

---

## 🐛 Quick Troubleshooting

### Can't Access Application
```bash
# Check pods
kubectl get pods -n orgconnect

# Check services
kubectl get svc -n orgconnect

# Check security group
aws ec2 describe-security-groups --group-ids sg-01fa7cd33889c744f
```

### Jenkins Build Fails
```bash
# Verify Docker credentials
docker login

# Check Jenkins can access Docker
sudo -u jenkins docker ps

# Check kubectl access
sudo -u jenkins kubectl get nodes
```

### Pods Not Starting
```bash
# Describe pod
kubectl describe pod <pod-name> -n orgconnect

# Check logs
kubectl logs <pod-name> -n orgconnect

# Check events
kubectl get events -n orgconnect --sort-by='.lastTimestamp'
```

### Out of Memory
```bash
# Add swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Check memory
free -h

# Reduce replicas
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=1
```

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| **COMPLETE-DEPLOYMENT-GUIDE.md** | Full deployment with all links |
| **JENKINS-SETUP-FINAL.md** | Jenkins CI/CD setup guide |
| **README.md** | Project overview |
| **QUICKSTART.md** | 30-minute setup guide |
| **docs/AWS-SETUP.md** | AWS infrastructure setup |
| **docs/DEPLOYMENT.md** | Deployment procedures |
| **docs/ARCHITECTURE.md** | Technical architecture |
| **docs/TROUBLESHOOTING.md** | Problem resolution |
| **docs/PRESENTATION-GUIDE.md** | Presentation preparation |

---

## 📞 Important Links

### AWS Resources
- **Console:** https://console.aws.amazon.com/
- **EC2:** https://us-east-1.console.aws.amazon.com/ec2/
- **IAM:** https://us-east-1.console.aws.amazon.com/iam/
- **Cost Explorer:** https://console.aws.amazon.com/cost-management/
- **Billing:** https://console.aws.amazon.com/billing/

### Documentation
- **AWS Docs:** https://docs.aws.amazon.com/
- **Kubernetes:** https://kubernetes.io/docs/
- **Jenkins:** https://www.jenkins.io/doc/
- **Docker:** https://docs.docker.com/
- **React:** https://react.dev/

### Your Resources
- **GitHub:** https://github.com/pranavtomar1/ORG_Connect
- **Docker Hub:** https://hub.docker.com/r/pranavtomar1/orgconnect
- **Application:** http://54.175.47.56:30080
- **Jenkins:** http://54.175.47.56:8080

---

## ✅ Pre-Presentation Checklist

- [ ] EC2 instance running
- [ ] Application accessible
- [ ] Jenkins accessible
- [ ] Know Jenkins admin password
- [ ] Can SSH to EC2
- [ ] kubectl commands work
- [ ] Blue-Green switch works
- [ ] Rollback tested
- [ ] Presentation slides ready
- [ ] Architecture diagram printed
- [ ] Demo practiced
- [ ] Q&A answers prepared

---

## 🎯 Key Demonstration Points

1. **Show Infrastructure**
   - AWS Console with running EC2
   - kubectl get nodes
   - kubectl get all -n orgconnect

2. **Show Application**
   - http://54.175.47.56:30080
   - Working features
   - Health check endpoint

3. **Make Code Change**
   - Edit src/App.tsx
   - Commit and push
   - Show GitHub commit

4. **Show Pipeline**
   - Jenkins dashboard
   - Pipeline stages
   - Console output

5. **Demonstrate Zero Downtime**
   - Keep app open during deployment
   - Show no errors
   - Show new version

6. **Show Cost Efficiency**
   - ~$18/month
   - 5+ months on $100
   - Cost optimization strategies

---

## 💡 Q&A Preparation

**Q: Why Blue-Green over Rolling Update?**
- Instant rollback capability
- Full environment testing before switch
- True zero-downtime guarantee

**Q: How is this different from Canary?**
- Blue-Green switches 100% at once
- Canary gradually increases percentage
- Blue-Green simpler for this use case

**Q: What if both environments fail?**
- Automatic rollback in pipeline
- Keep previous Docker images
- Can redeploy any version quickly

**Q: Cost in production?**
- Would use multiple nodes
- Add load balancer (~$16/month)
- Use managed EKS (~$72/month)
- Total: ~$150-200/month for small app

**Q: Security concerns?**
- AWS Security Groups
- Kubernetes RBAC
- Docker image scanning
- SSL/TLS termination

---

**🎓 For best results: Practice the demo 2-3 times before presenting!**

**📧 Questions? Check COMPLETE-DEPLOYMENT-GUIDE.md**

---

*Print this card and keep it handy during your presentation!*

