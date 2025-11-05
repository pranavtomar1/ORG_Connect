# Troubleshooting Guide

Comprehensive troubleshooting guide for common issues in the Blue-Green Deployment setup.

## Table of Contents
1. [Quick Diagnostics](#quick-diagnostics)
2. [Kubernetes Issues](#kubernetes-issues)
3. [Jenkins Issues](#jenkins-issues)
4. [Docker Issues](#docker-issues)
5. [Networking Issues](#networking-issues)
6. [AWS Issues](#aws-issues)
7. [Application Issues](#application-issues)
8. [Performance Issues](#performance-issues)

---

## Quick Diagnostics

### Run These First

```bash
# Check overall system status
kubectl get nodes
kubectl get pods -n orgconnect
kubectl get svc -n orgconnect
sudo systemctl status jenkins
docker ps

# Check resource usage
kubectl top nodes
kubectl top pods -n orgconnect
free -h
df -h
```

### Health Check Script

```bash
#!/bin/bash
echo "=== Node Status ==="
kubectl get nodes

echo -e "\n=== Pod Status ==="
kubectl get pods -n orgconnect

echo -e "\n=== Service Status ==="
kubectl get svc -n orgconnect

echo -e "\n=== Active Service Selector ==="
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector}'

echo -e "\n\n=== Jenkins Status ==="
sudo systemctl status jenkins | head -n 5

echo -e "\n=== Disk Usage ==="
df -h / | tail -n 1

echo -e "\n=== Memory Usage ==="
free -h | grep Mem
```

---

## Kubernetes Issues

### Issue 1: Pods Not Starting (Pending)

**Symptoms:**
```bash
kubectl get pods -n orgconnect
NAME                               READY   STATUS    RESTARTS   AGE
orgconnect-blue-xxxxxxxxxx-xxxxx   0/1     Pending   0          5m
```

**Diagnosis:**
```bash
kubectl describe pod <pod-name> -n orgconnect
# Look for: "Insufficient cpu" or "Insufficient memory"
```

**Solutions:**

1. **Check Node Resources:**
```bash
kubectl describe nodes | grep -A 5 "Allocated resources"
kubectl top nodes
```

2. **Scale Down Other Deployments:**
```bash
# Scale down the inactive environment
kubectl scale deployment/orgconnect-green -n orgconnect --replicas=0
```

3. **Reduce Resource Requests:**
Edit `k8s/deployment-blue.yaml`:
```yaml
resources:
  requests:
    memory: "64Mi"   # Reduced from 128Mi
    cpu: "50m"       # Reduced from 100m
  limits:
    memory: "128Mi"  # Reduced from 256Mi
    cpu: "100m"      # Reduced from 200m
```

4. **Upgrade EC2 Instance:**
- Stop instance
- Change type to t3.medium or t3.large
- Start instance

---

### Issue 2: Pods Crashing (CrashLoopBackOff)

**Symptoms:**
```bash
NAME                               READY   STATUS             RESTARTS   AGE
orgconnect-blue-xxxxxxxxxx-xxxxx   0/1     CrashLoopBackOff   5          5m
```

**Diagnosis:**
```bash
# Check pod logs
kubectl logs <pod-name> -n orgconnect

# Check previous logs
kubectl logs <pod-name> -n orgconnect --previous

# Describe pod for events
kubectl describe pod <pod-name> -n orgconnect
```

**Common Causes:**

1. **Image Pull Error:**
```bash
# Check events
kubectl describe pod <pod-name> -n orgconnect | grep -A 10 Events

# Verify image exists
docker pull yourusername/orgconnect:latest

# Fix: Update imagePullSecrets or make image public
```

2. **Application Error:**
```bash
# Check logs for errors
kubectl logs <pod-name> -n orgconnect | tail -n 50

# Common issues:
# - Missing environment variables
# - Wrong port configuration
# - Application startup failure
```

3. **Health Check Failing:**
```bash
# Test health endpoint manually
kubectl run test-pod --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl -v http://orgconnect-blue.orgconnect.svc.cluster.local/health

# If fails, adjust health check timings in deployment YAML
initialDelaySeconds: 30  # Increase if app takes time to start
```

**Solutions:**

1. **Disable Health Checks Temporarily:**
Comment out livenessProbe and readinessProbe in deployment YAML

2. **Check Nginx Configuration:**
```bash
# Get shell in pod
kubectl exec -it <pod-name> -n orgconnect -- /bin/sh

# Test nginx config
nginx -t

# Check if files exist
ls -la /usr/share/nginx/html/
```

3. **Verify Docker Image:**
```bash
# Run locally
docker run -p 8080:80 yourusername/orgconnect:latest

# Test
curl http://localhost:8080/health
```

---

### Issue 3: Pods Running But Not Ready

**Symptoms:**
```bash
NAME                               READY   STATUS    RESTARTS   AGE
orgconnect-blue-xxxxxxxxxx-xxxxx   0/1     Running   0          5m
```

**Diagnosis:**
```bash
kubectl describe pod <pod-name> -n orgconnect
# Look at "Conditions" and "Events"
```

**Solutions:**

1. **Readiness Probe Failing:**
```bash
# Check what readiness probe expects
kubectl get deployment orgconnect-blue -n orgconnect -o yaml | grep -A 10 readinessProbe

# Test endpoint manually
kubectl exec <pod-name> -n orgconnect -- wget -O- http://localhost/health
```

2. **Increase Probe Timeouts:**
```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 15  # Increased
  periodSeconds: 10        # Increased
  timeoutSeconds: 5        # Increased
  failureThreshold: 5      # Increased
```

---

### Issue 4: Service Not Routing Traffic

**Symptoms:**
- Pods are running and ready
- Cannot access application via NodePort

**Diagnosis:**
```bash
# Check service
kubectl get svc orgconnect-active -n orgconnect

# Check endpoints
kubectl get endpoints orgconnect-active -n orgconnect

# Check service selector
kubectl get svc orgconnect-active -n orgconnect -o yaml | grep -A 5 selector
```

**Solutions:**

1. **Verify Selector Matches Pods:**
```bash
# Get service selector
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector}'

# Check pod labels
kubectl get pods -n orgconnect --show-labels

# They must match!
```

2. **Manually Patch Service:**
```bash
# Switch to blue
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"blue"}}}'

# Or switch to green
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"green"}}}'
```

3. **Check Endpoints:**
```bash
kubectl describe endpoints orgconnect-active -n orgconnect

# Should show IP addresses of pods
# If empty, selector is wrong or pods not ready
```

---

## Jenkins Issues

### Issue 1: Jenkins Won't Start

**Symptoms:**
```bash
sudo systemctl status jenkins
● jenkins.service - Jenkins
   Loaded: loaded
   Active: failed
```

**Diagnosis:**
```bash
# Check logs
sudo journalctl -u jenkins -n 50 --no-pager

# Check Jenkins log file
sudo tail -f /var/log/jenkins/jenkins.log
```

**Solutions:**

1. **Port 8080 Already in Use:**
```bash
# Check what's using port 8080
sudo netstat -tulpn | grep 8080

# Kill conflicting process or change Jenkins port
sudo vim /etc/default/jenkins
# Change HTTP_PORT=8080 to HTTP_PORT=8081
sudo systemctl restart jenkins
```

2. **Java Not Installed:**
```bash
java -version
# If not found, install
sudo apt update
sudo apt install openjdk-17-jdk -y
sudo systemctl restart jenkins
```

3. **Insufficient Memory:**
```bash
free -h
# If less than 1GB free, increase swap or upgrade instance
```

4. **Permissions Issue:**
```bash
sudo chown -R jenkins:jenkins /var/lib/jenkins
sudo systemctl restart jenkins
```

---

### Issue 2: Jenkins Can't Access Docker

**Symptoms:**
- Pipeline fails at "Build Docker Image" stage
- Error: "permission denied while trying to connect to Docker daemon"

**Diagnosis:**
```bash
# Test Jenkins user access
sudo -u jenkins docker ps
```

**Solutions:**

1. **Add Jenkins to Docker Group:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verify
sudo -u jenkins docker ps
```

2. **Check Docker Socket Permissions:**
```bash
ls -la /var/run/docker.sock
# Should be: srw-rw---- 1 root docker

# If not, fix it
sudo chmod 666 /var/run/docker.sock  # Quick fix (not permanent)
# Or
sudo systemctl restart docker
```

---

### Issue 3: Jenkins Can't Access Kubernetes

**Symptoms:**
- Pipeline fails at "Deploy to Target" stage
- Error: "The connection to the server localhost:8080 was refused"

**Diagnosis:**
```bash
# Test Jenkins user access
sudo -u jenkins kubectl get nodes
```

**Solutions:**

1. **Configure Kubeconfig for Jenkins:**
```bash
# Copy kubeconfig
sudo mkdir -p /var/lib/jenkins/.kube
sudo cp /etc/kubernetes/admin.conf /var/lib/jenkins/.kube/config
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
```

2. **Set KUBECONFIG Environment Variable:**
```bash
sudo su - jenkins
export KUBECONFIG=/var/lib/jenkins/.kube/config
kubectl get nodes  # Should work now
```

3. **Update Jenkinsfile:**
Add environment variable:
```groovy
environment {
    KUBECONFIG = '/var/lib/jenkins/.kube/config'
}
```

---

### Issue 4: Jenkins Pipeline Fails at Health Check

**Symptoms:**
- Pipeline fails at "Health Check on Target" stage
- Error: "Health check failed after X attempts"

**Diagnosis:**
```bash
# Manually run health check
kubectl run test-health --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl -f http://orgconnect-green.orgconnect.svc.cluster.local/health
```

**Solutions:**

1. **Increase Health Check Retries:**
Edit Jenkinsfile:
```groovy
environment {
    HEALTH_CHECK_RETRIES = 10  // Increased from 5
    HEALTH_CHECK_DELAY = 15    // Increased from 10
}
```

2. **Check Service DNS:**
```bash
# Test DNS resolution
kubectl run test-dns --image=busybox:1.28 \
  --restart=Never -n orgconnect --rm -i \
  -- nslookup orgconnect-green.orgconnect.svc.cluster.local
```

3. **Verify Pods Are Ready:**
```bash
kubectl get pods -n orgconnect -l version=green

# All should show READY 1/1
```

---

## Docker Issues

### Issue 1: Cannot Push to Docker Hub

**Symptoms:**
- Error: "denied: requested access to the resource is denied"

**Solutions:**

1. **Login to Docker Hub:**
```bash
docker login
# Enter username and password
```

2. **Check Image Name:**
```bash
# Must be: username/repository:tag
docker images | grep orgconnect

# If wrong, retag
docker tag wrong-name:tag yourusername/orgconnect:tag
```

3. **Verify Repository Exists:**
- Go to hub.docker.com
- Create repository: orgconnect
- Make it public (for free tier)

---

### Issue 2: Docker Build Fails

**Symptoms:**
- Error during `docker build`

**Common Causes:**

1. **npm install Fails:**
```dockerfile
# In Dockerfile, add retry logic
RUN npm ci || npm install
```

2. **Out of Disk Space:**
```bash
df -h
# If disk full, clean up
docker system prune -a -f
```

3. **Base Image Not Found:**
```bash
# Test pulling base image
docker pull node:18-alpine
docker pull nginx:alpine
```

---

## Networking Issues

### Issue 1: Cannot Access Application from Browser

**Symptoms:**
- `http://<EC2-IP>:30080` times out or connection refused

**Diagnosis Checklist:**

```bash
# 1. Check if pods are running
kubectl get pods -n orgconnect

# 2. Check if service exists
kubectl get svc -n orgconnect

# 3. Check NodePort
kubectl get svc orgconnect-active -n orgconnect -o yaml | grep nodePort

# 4. Test from within cluster
kubectl run test --image=curlimages/curl:latest \
  --restart=Never -n orgconnect --rm -i \
  -- curl http://orgconnect-active.orgconnect.svc.cluster.local

# 5. Test from EC2 instance
curl http://localhost:30080

# 6. Check security group
aws ec2 describe-security-groups --group-ids <sg-id>
```

**Solutions:**

1. **Security Group Not Allowing Port 30080:**
- AWS Console → EC2 → Security Groups
- Add inbound rule: Type=Custom TCP, Port=30080, Source=0.0.0.0/0

2. **Service Selector Wrong:**
```bash
kubectl patch service orgconnect-active -n orgconnect \
  -p '{"spec":{"selector":{"version":"blue"}}}'
```

3. **Firewall on EC2:**
```bash
# Check if UFW is active
sudo ufw status

# If active, allow port
sudo ufw allow 30080/tcp

# Or disable for testing
sudo ufw disable
```

---

### Issue 2: DNS Resolution Not Working

**Symptoms:**
- Pods can't reach other services by name
- Error: "could not resolve host"

**Solutions:**

1. **Check CoreDNS:**
```bash
kubectl get pods -n kube-system | grep coredns

# Should show 2 coredns pods running
# If not, restart
kubectl rollout restart deployment/coredns -n kube-system
```

2. **Test DNS from Pod:**
```bash
kubectl run test-dns --image=busybox:1.28 \
  --restart=Never -n orgconnect --rm -i \
  -- nslookup kubernetes.default

# Should resolve
```

3. **Check DNS Config:**
```bash
kubectl get configmap coredns -n kube-system -o yaml
```

---

## AWS Issues

### Issue 1: EC2 Instance Out of Memory

**Symptoms:**
```bash
free -h
              total        used        free
Mem:          1.9Gi       1.8Gi       100Mi
```

**Solutions:**

1. **Add Swap Space:**
```bash
# Create 2GB swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

2. **Scale Down Deployments:**
```bash
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=1
kubectl scale deployment/orgconnect-green -n orgconnect --replicas=1
```

3. **Upgrade Instance Type:**
- Stop instance
- Change type: t3.small → t3.medium
- Start instance

---

### Issue 2: Disk Space Full

**Symptoms:**
```bash
df -h
/dev/xvda1        30G   29G  100M  100% /
```

**Solutions:**

1. **Clean Docker:**
```bash
docker system prune -a -f
docker volume prune -f
```

2. **Clean Journal Logs:**
```bash
sudo journalctl --vacuum-time=3d
```

3. **Clean Package Cache:**
```bash
sudo apt clean
sudo apt autoremove -y
```

4. **Find Large Files:**
```bash
sudo du -h / | sort -rh | head -n 20
```

5. **Expand EBS Volume:**
- AWS Console → EC2 → Volumes
- Modify volume size
- Resize filesystem:
```bash
sudo growpart /dev/xvda 1
sudo resize2fs /dev/xvda1
```

---

### Issue 3: Cannot SSH to Instance

**Symptoms:**
- Connection timeout or "Permission denied"

**Solutions:**

1. **Check Security Group:**
- Must allow port 22 from your IP

2. **Verify Key File:**
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-IP>
```

3. **Check Instance State:**
- Must be "running" in AWS Console

4. **Use EC2 Instance Connect:**
- AWS Console → EC2 → Connect → EC2 Instance Connect

---

## Application Issues

### Issue 1: Blank Page / White Screen

**Symptoms:**
- Application loads but shows nothing

**Diagnosis:**
```bash
# Check browser console for errors
# Check nginx logs
kubectl logs <pod-name> -n orgconnect

# Verify files exist in container
kubectl exec <pod-name> -n orgconnect -- ls -la /usr/share/nginx/html/
```

**Solutions:**

1. **Incorrect Base Path:**
Edit `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/',  // Ensure this is correct
  // ...
});
```

2. **Missing Build Files:**
```bash
# Rebuild Docker image
docker build -t yourusername/orgconnect:latest .

# Check build output
docker run --rm yourusername/orgconnect:latest ls -la /usr/share/nginx/html/
```

---

### Issue 2: API Calls Failing (if you add backend later)

**Solutions:**

1. **CORS Issues:**
Add to nginx.conf:
```nginx
add_header 'Access-Control-Allow-Origin' '*';
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
```

2. **Wrong API URL:**
Check environment variables in deployment

---

## Performance Issues

### Issue 1: Slow Application Response

**Diagnosis:**
```bash
# Check pod resources
kubectl top pods -n orgconnect

# Check node resources
kubectl top nodes

# Check for throttling
kubectl describe pod <pod-name> -n orgconnect | grep -i throttl
```

**Solutions:**

1. **Increase Resource Limits:**
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

2. **Add More Replicas:**
```bash
kubectl scale deployment/orgconnect-blue -n orgconnect --replicas=3
```

3. **Enable Caching:**
Already configured in nginx.conf

---

### Issue 2: High Memory Usage

**Solutions:**

1. **Check for Memory Leaks:**
```bash
kubectl top pods -n orgconnect
# Monitor over time
```

2. **Add Memory Limits:**
Prevents pods from consuming all node memory

3. **Restart Pods Periodically:**
```bash
kubectl rollout restart deployment/orgconnect-blue -n orgconnect
```

---

## Emergency Procedures

### Complete Reset

If everything is broken:

```bash
# Delete namespace
kubectl delete namespace orgconnect

# Recreate
kubectl apply -f k8s/namespace.yaml

# Redeploy
./scripts/deploy-app.sh
```

### Cluster Reset

If Kubernetes is completely broken:

```bash
# Reset cluster
sudo kubeadm reset -f

# Re-initialize
sudo ./scripts/init-cluster.sh
```

### Start Fresh

Complete reinstall:

```bash
# Remove everything
sudo kubeadm reset -f
sudo apt remove --purge kubeadm kubectl kubelet kubernetes-cni -y
sudo apt autoremove -y
sudo rm -rf /etc/kubernetes /var/lib/kubelet /var/lib/etcd

# Reinstall
sudo ./scripts/setup-k8s.sh
sudo ./scripts/init-cluster.sh
```

---

## Getting Additional Help

### Useful Commands

```bash
# Get all events
kubectl get events -n orgconnect --sort-by='.lastTimestamp'

# Describe all resources
kubectl describe all -n orgconnect

# Export all manifests
kubectl get all -n orgconnect -o yaml > backup.yaml

# Check API server
kubectl cluster-info

# Check component status
kubectl get componentstatuses
```

### Log Files

```bash
# Kubelet logs
sudo journalctl -u kubelet -n 100 --no-pager

# Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# System logs
sudo journalctl -xe

# Docker logs
sudo journalctl -u docker -n 100 --no-pager
```

### Useful Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [AWS EC2 Troubleshooting](https://docs.aws.amazon.com/ec2/)

---

## Still Stuck?

1. Collect diagnostics:
```bash
./scripts/deploy-app.sh
# Choose option 5 (Show current status)
```

2. Export logs:
```bash
kubectl logs <pod-name> -n orgconnect > pod-logs.txt
sudo journalctl -u jenkins -n 200 > jenkins-logs.txt
```

3. Check GitHub Issues for similar problems
4. Create detailed issue with logs and error messages

---

**Remember:** Most issues are related to:
1. Resource constraints (memory/CPU)
2. Networking/Security groups
3. Configuration mismatches
4. Image pull problems

Start with the basics and work your way up!

