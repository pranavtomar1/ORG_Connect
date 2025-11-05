# AWS Infrastructure Setup Guide

This guide provides step-by-step instructions for setting up the AWS infrastructure required for the blue-green deployment strategy.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Account Setup](#aws-account-setup)
3. [EC2 Instance Setup](#ec2-instance-setup)
4. [Security Groups Configuration](#security-groups-configuration)
5. [Elastic IP (Optional)](#elastic-ip-optional)
6. [Application Load Balancer Setup](#application-load-balancer-setup)
7. [Cost Optimization Tips](#cost-optimization-tips)

---

## Prerequisites

- AWS Account with $100 free tier credits
- Basic knowledge of AWS Console
- SSH key pair for accessing EC2 instances
- Local terminal with SSH client

---

## AWS Account Setup

### 1. Create AWS Account
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Follow the registration process
4. Add your $100 credits if you have a promotional code

### 2. Configure AWS Region
For this tutorial, we recommend using **us-east-1 (N. Virginia)** for lower costs and better free tier coverage.

1. Log into AWS Console
2. Select region from top-right dropdown
3. Choose **US East (N. Virginia) us-east-1**

---

## EC2 Instance Setup

### Option 1: Single Instance (Recommended for College Assignment)

**Instance Specifications:**
- **Instance Type:** t3.medium (2 vCPU, 4GB RAM) or t3.small (2 vCPU, 2GB RAM)
- **AMI:** Ubuntu Server 22.04 LTS
- **Storage:** 20-30 GB gp3
- **Purpose:** Run both Kubernetes cluster and Jenkins

**Cost:** ~$20-30/month (t3.medium) or ~$15/month (t3.small)

#### Steps:

1. **Navigate to EC2 Dashboard**
   - Go to Services → EC2
   - Click "Launch Instance"

2. **Configure Instance**
   - **Name:** `k8s-jenkins-server`
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type:** t3.medium (or t3.small for lower cost)
   - **Key Pair:** Create new or select existing
   - **Network Settings:** See security group section below

3. **Configure Storage**
   - **Size:** 30 GB
   - **Volume Type:** gp3 (better performance than gp2)

4. **Advanced Details**
   - **Enable:** Termination Protection (optional)
   - **User Data:** (optional - can run setup scripts on first boot)

### Option 2: Separate Instances (Better Isolation)

**Instance 1: Kubernetes Cluster**
- **Type:** t3.medium
- **Name:** `k8s-master`

**Instance 2: Jenkins Server**
- **Type:** t3.micro (Free tier eligible)
- **Name:** `jenkins-server`

**Cost:** ~$30-40/month

---

## Security Groups Configuration

Create a security group with the following inbound rules:

### Security Group: `k8s-jenkins-sg`

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Application access |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure application access |
| Custom TCP | TCP | 8080 | Your IP | Jenkins Web UI |
| Custom TCP | TCP | 6443 | Instance SG | Kubernetes API Server |
| Custom TCP | TCP | 30000-32767 | 0.0.0.0/0 | NodePort Services |
| Custom TCP | TCP | 10250 | Instance SG | Kubelet API |
| Custom TCP | TCP | 2379-2380 | Instance SG | etcd |

### Steps to Create Security Group:

1. **Navigate to Security Groups**
   - EC2 Dashboard → Network & Security → Security Groups
   - Click "Create security group"

2. **Configure Basic Settings**
   - **Name:** `k8s-jenkins-sg`
   - **Description:** Security group for K8s and Jenkins
   - **VPC:** Default VPC

3. **Add Inbound Rules**
   - Click "Add rule" for each rule in the table above
   - For "Your IP", use your current IP address
   - For "Instance SG", select the security group itself (recursive)

4. **Outbound Rules**
   - Leave default (All traffic to 0.0.0.0/0)

5. **Create Security Group**

---

## Elastic IP (Optional)

For a stable public IP address that doesn't change when you stop/start instances:

1. **Navigate to Elastic IPs**
   - EC2 Dashboard → Network & Security → Elastic IPs

2. **Allocate Elastic IP**
   - Click "Allocate Elastic IP address"
   - Click "Allocate"

3. **Associate with Instance**
   - Select the Elastic IP
   - Actions → Associate Elastic IP address
   - Select your instance
   - Click "Associate"

**Cost:** Free while associated with a running instance, $0.005/hour when unassociated

---

## Application Load Balancer Setup

### When to Use ALB:
- For production-like setup
- To demonstrate AWS load balancing
- For SSL termination
- For advanced routing

### ALB Configuration:

1. **Navigate to Load Balancers**
   - EC2 Dashboard → Load Balancing → Load Balancers
   - Click "Create Load Balancer"

2. **Select Type**
   - Choose "Application Load Balancer"

3. **Basic Configuration**
   - **Name:** `orgconnect-alb`
   - **Scheme:** Internet-facing
   - **IP address type:** IPv4

4. **Network Mapping**
   - **VPC:** Default VPC
   - **Availability Zones:** Select at least 2 AZs
   - Select public subnets

5. **Security Groups**
   - Select `k8s-jenkins-sg` or create a new one with ports 80, 443

6. **Listeners**
   - **HTTP:** Port 80 → Forward to target group

7. **Target Group**
   - **Name:** `orgconnect-targets`
   - **Target type:** Instance
   - **Protocol:** HTTP
   - **Port:** 30080 (NodePort)
   - **Health check path:** `/health`
   - **Register targets:** Select your EC2 instance

8. **Review and Create**

**Cost:** ~$16/month + data transfer costs

### Alternative: Direct Access via NodePort

For a college assignment, you can skip the ALB and access the application directly:
- URL: `http://<EC2-PUBLIC-IP>:30080`
- This saves ~$16/month

---

## Connect to EC2 Instance

### Using SSH:

```bash
# Make sure your key has correct permissions
chmod 400 your-key.pem

# Connect to instance
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### Using EC2 Instance Connect:
1. Go to EC2 Console
2. Select your instance
3. Click "Connect"
4. Choose "EC2 Instance Connect"
5. Click "Connect"

---

## Post-Instance Launch Setup

Once connected to your EC2 instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Clone your repository
git clone https://github.com/yourusername/org-connect.git
cd org-connect/ORG_Connect

# Make scripts executable
chmod +x scripts/*.sh

# Run Kubernetes setup
sudo ./scripts/setup-k8s.sh

# Initialize cluster
sudo ./scripts/init-cluster.sh

# Install Jenkins
sudo ./scripts/jenkins-setup.sh
```

---

## Cost Optimization Tips

### 1. Use Spot Instances
- Up to 90% discount
- Good for development/testing
- Risk: Can be terminated with 2-minute notice

### 2. Stop Instances When Not in Use
- You only pay for EBS storage when stopped (~$3/month for 30GB)
- Use AWS Lambda + CloudWatch to auto-stop at night

### 3. Use t3/t3a Instance Types
- Better price/performance than t2
- t3a is ~10% cheaper than t3

### 4. Monitor Your Costs
- Enable AWS Cost Explorer
- Set up billing alerts
- Check AWS Free Tier usage dashboard

### 5. Clean Up Resources
- Delete unused volumes
- Release unassociated Elastic IPs
- Delete old snapshots
- Remove unused load balancers

### 6. Right-Size Your Instances
- Start with t3.small
- Monitor CPU/Memory usage
- Upgrade only if needed

---

## Cost Breakdown (Monthly)

### Minimal Setup (Single t3.small):
- EC2 t3.small: ~$15/month
- EBS 30GB: ~$3/month
- Data transfer: ~$1-2/month
- **Total: ~$19-20/month** (5 months on $100 credit)

### Recommended Setup (Single t3.medium):
- EC2 t3.medium: ~$30/month
- EBS 30GB: ~$3/month
- Data transfer: ~$2/month
- **Total: ~$35/month** (2.8 months on $100 credit)

### Full Setup (with ALB):
- EC2 t3.medium: ~$30/month
- EBS 30GB: ~$3/month
- ALB: ~$16/month
- Data transfer: ~$3/month
- **Total: ~$52/month** (2 months on $100 credit)

---

## Troubleshooting

### Cannot Connect via SSH
- Check security group allows SSH from your IP
- Verify key file permissions (should be 400)
- Ensure instance is in "running" state
- Check if you're using correct username (ubuntu for Ubuntu AMI)

### Port 8080 Not Accessible
- Check security group allows 8080 from your IP
- Verify Jenkins is running: `sudo systemctl status jenkins`
- Check if firewall is blocking: `sudo ufw status`

### Out of Memory
- Instance type too small
- Reduce Kubernetes pod resource limits
- Reduce number of replicas
- Upgrade to larger instance type

### High Costs
- Check for unassociated Elastic IPs
- Look for unused volumes
- Review data transfer charges
- Consider stopping instances at night

---

## Next Steps

After completing AWS setup:
1. Follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Configure Jenkins credentials
3. Run your first deployment
4. Test blue-green switching

---

## Additional Resources

- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [EC2 Pricing Calculator](https://calculator.aws/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [Kubernetes on AWS](https://kubernetes.io/docs/setup/production-environment/)

