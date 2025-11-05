# Jenkins CI/CD Pipeline - Final Setup Steps

## ✅ What We Fixed

1. **Removed kubeconfig credential dependency** - Jenkins now uses the kubectl already configured for the jenkins user
2. **Hardcoded Docker image name** - Simplified configuration
3. **Improved error handling** - Better rollback mechanism
4. **Fixed credential references** - Proper string escaping

---

## 🔧 Final Steps to Complete

### Step 1: Verify Docker Hub Credentials in Jenkins

**Go to Jenkins:**
1. Navigate to: http://54.175.47.56:8080
2. Click **"Manage Jenkins"** → **"Credentials"**
3. Click **(global)** domain
4. Find **"docker-credentials"**

**Verify it has:**
- **Kind:** Username with password
- **Username:** pranavtomar1
- **Password:** [your correct Docker Hub password]
- **ID:** docker-credentials

**If it doesn't exist or password is wrong:**
1. Click **"Add Credentials"**
2. **Kind:** Username with password
3. **Username:** `pranavtomar1`
4. **Password:** `[your-docker-hub-password]`
5. **ID:** `docker-credentials`
6. **Description:** Docker Hub Login
7. Click **"Create"**

---

### Step 2: Test the Pipeline

1. Go to Jenkins Dashboard
2. Click on **"orgconnect-pipeline"**
3. Click **"Build Now"**
4. Watch the build progress

**Expected Flow:**
```
✓ Checkout - Gets code from GitHub
✓ Build Docker Image - Builds your app
✓ Push to Registry - Pushes to Docker Hub
✓ Determine Active Environment - Finds Blue is active
✓ Deploy to Target Environment - Deploys to Green
✓ Health Check on Target - Tests Green is healthy
✓ Switch Traffic - Routes users to Green
✓ Post-Deployment Verification - Confirms success
✓ Scale Down Old Environment - Scales down Blue
```

---

### Step 3: Verify Zero-Downtime Deployment

**Open your application:** http://54.175.47.56:30080

**While Jenkins pipeline is running:**
- Keep refreshing the browser
- You should see NO errors or downtime
- Application stays available throughout

**After pipeline completes:**
- Application still works
- Now showing new version

---

## 🎯 Testing Blue-Green Deployment

### Make a Visible Change

**Option 1: Change App Title (Simple)**

In your local machine or EC2:
```bash
# Edit the app
nano src/App.tsx

# Find line ~85 and change:
<h1 className="text-3xl font-bold text-blue-900">OrgConnect v2.0</h1>

# Save and commit
git add src/App.tsx
git commit -m "Update to v2.0"
git push origin main
```

Jenkins will automatically:
1. Detect the change (within 5 minutes)
2. Build new Docker image
3. Deploy to inactive environment
4. Switch traffic with zero downtime

---

## 📊 Monitoring the Deployment

### In Jenkins Console Output, you'll see:

```
Current active environment: blue
Target deployment environment: green

Building Docker image: pranavtomar1/orgconnect:4
Pushing Docker image to registry...
Deploying to green environment...
Waiting for green deployment to be ready...
deployment "orgconnect-green" successfully rolled out

Performing health checks on green environment...
Health check passed!

Switching traffic from blue to green...
Traffic successfully switched to green!

Post-deployment verification completed successfully!
Scaling down old blue environment...

========================================
DEPLOYMENT SUCCESSFUL
========================================
```

### In Kubernetes (EC2 terminal):

```bash
# Watch pods during deployment
kubectl get pods -n orgconnect -w

# Check which environment is active
kubectl get svc orgconnect-active -n orgconnect -o jsonpath='{.spec.selector.version}'

# View all resources
kubectl get all -n orgconnect
```

---

## 🔄 Complete Blue-Green Cycle

### Current State:
- **Blue:** v1.0 (Active - serving traffic)
- **Green:** Empty

### After First Pipeline Run:
- **Blue:** v1.0 (Scaled down)
- **Green:** v2.0 (Active - serving traffic)

### After Second Pipeline Run:
- **Blue:** v3.0 (Active - serving traffic)
- **Green:** v2.0 (Scaled down)

### Pattern:
Each deployment alternates between Blue and Green, ensuring zero downtime!

---

## 🎓 For Your College Assignment

### What You Can Demonstrate:

1. **Infrastructure as Code**
   - All configurations in Git
   - Reproducible setup

2. **Automated CI/CD**
   - Code change triggers pipeline
   - Automatic build and deployment
   - No manual intervention needed

3. **Zero-Downtime Deployment**
   - Blue-Green strategy
   - Traffic switch in milliseconds
   - No service interruption

4. **Automatic Rollback**
   - If health checks fail, automatic rollback
   - Previous version immediately restored

5. **Cost Optimization**
   - t3.small instance (~$15/month)
   - Fits within $100 credit
   - Resource-efficient configuration

### Presentation Flow:

1. **Show Architecture** (diagrams in docs/)
2. **Show Running Infrastructure** (AWS Console, kubectl commands)
3. **Make Code Change** (update app title)
4. **Trigger Pipeline** (git push or manual)
5. **Show Zero Downtime** (app stays up during deployment)
6. **Show Result** (new version live)
7. **Explain Cost** (affordable for learning)

---

## 🐛 Troubleshooting

### If Pipeline Fails at "Push to Registry":

**Check Docker credentials:**
```bash
# On EC2, test Docker login
docker login
# Enter: pranavtomar1 / [your-password]
```

If it works on EC2 but fails in Jenkins, update Jenkins credentials with the correct password.

### If Pipeline Fails at "Deploy to Target":

**Check kubectl access:**
```bash
# On EC2, test as jenkins user
sudo -u jenkins kubectl get nodes
```

Should show your node. If not:
```bash
sudo cp ~/.kube/config /var/lib/jenkins/.kube/config
sudo chown jenkins:jenkins /var/lib/jenkins/.kube/config
```

### If Health Check Fails:

**Check pods are actually running:**
```bash
kubectl get pods -n orgconnect
kubectl logs <pod-name> -n orgconnect
```

---

## ✅ Success Criteria

Your CI/CD pipeline is complete when:

- ✅ Jenkins can build Docker images
- ✅ Jenkins can push to Docker Hub
- ✅ Jenkins can deploy to Kubernetes
- ✅ Health checks pass automatically
- ✅ Traffic switches without downtime
- ✅ Old environment scales down
- ✅ Application accessible throughout

---

## 🎉 You're Done When...

1. Pipeline runs successfully end-to-end
2. Application deploys without manual intervention
3. Zero downtime verified
4. You can explain every stage
5. Documentation is complete

**Congratulations on completing your Blue-Green Deployment with full CI/CD automation!** 🚀

