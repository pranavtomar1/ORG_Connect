# Architecture Documentation

Detailed technical architecture of the Blue-Green Deployment System for OrgConnect.

## Table of Contents
1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Network Architecture](#network-architecture)
4. [Deployment Architecture](#deployment-architecture)
5. [Security Architecture](#security-architecture)
6. [Data Flow](#data-flow)

---

## System Overview

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                           Developer Workspace                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│  │  Local IDE   │───▶│  Git Client  │───▶│   GitHub     │             │
│  └──────────────┘    └──────────────┘    └──────┬───────┘             │
└─────────────────────────────────────────────────┼───────────────────────┘
                                                   │
                                                   │ Webhook/Poll
                                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                         EC2 Instance                               │ │
│  │                                                                     │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │                    Jenkins CI/CD Server                       │ │ │
│  │  │                                                                │ │ │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │ │ │
│  │  │  │   Build     │  │    Test     │  │   Deploy    │          │ │ │
│  │  │  │   Stage     │─▶│   Stage     │─▶│   Stage     │          │ │ │
│  │  │  └─────────────┘  └─────────────┘  └──────┬──────┘          │ │ │
│  │  │                                             │                  │ │ │
│  │  └─────────────────────────────────────────────┼─────────────────┘ │ │
│  │                                                 │                    │ │
│  │                                                 │ kubectl apply      │ │
│  │                                                 ▼                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │              Kubernetes Cluster (k8s)                         │ │ │
│  │  │                                                                │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │                    Namespace: orgconnect                 │ │ │ │
│  │  │  │                                                           │ │ │ │
│  │  │  │  ┌───────────────────────┐  ┌───────────────────────┐  │ │ │ │
│  │  │  │  │   Blue Deployment     │  │  Green Deployment     │  │ │ │ │
│  │  │  │  │   ┌─────┐  ┌─────┐    │  │   ┌─────┐  ┌─────┐    │  │ │ │ │
│  │  │  │  │   │Pod-1│  │Pod-2│    │  │   │Pod-1│  │Pod-2│    │  │ │ │ │
│  │  │  │  │   │ v1  │  │ v1  │    │  │   │ v2  │  │ v2  │    │  │ │ │ │
│  │  │  │  │   └──┬──┘  └──┬──┘    │  │   └──┬──┘  └──┬──┘    │  │ │ │ │
│  │  │  │  │      │        │        │  │      │        │        │  │ │ │ │
│  │  │  │  └──────┼────────┼────────┘  └──────┼────────┼────────┘  │ │ │ │
│  │  │  │         │        │                   │        │            │ │ │ │
│  │  │  │    ┌────▼────────▼────┐         ┌───▼────────▼─────┐     │ │ │ │
│  │  │  │    │  Service: Blue   │         │  Service: Green  │     │ │ │ │
│  │  │  │    │  ClusterIP       │         │  ClusterIP       │     │ │ │ │
│  │  │  │    └──────────────────┘         └──────────────────┘     │ │ │ │
│  │  │  │                                                           │ │ │ │
│  │  │  │         ┌──────────────────────────────────┐             │ │ │ │
│  │  │  │         │   Service: orgconnect-active     │             │ │ │ │
│  │  │  │         │   NodePort: 30080                │◄────────┐   │ │ │ │
│  │  │  │         │   Selector: version={blue/green} │         │   │ │ │ │
│  │  │  │         └────────────┬─────────────────────┘         │   │ │ │ │
│  │  │  │                      │                         Traffic│   │ │ │ │
│  │  │  │                      │                         Switch │   │ │ │ │
│  │  │  │         ┌────────────▼─────────────────────┐         │   │ │ │ │
│  │  │  │         │   Ingress Controller             │         │   │ │ │ │
│  │  │  │         │   (nginx)                        │         │   │ │ │ │
│  │  │  │         └────────────┬─────────────────────┘         │   │ │ │ │
│  │  │  │                      │                               │   │ │ │ │
│  │  │  └──────────────────────┼───────────────────────────────┘   │ │ │ │
│  │  │                         │                                   │ │ │ │
│  │  └─────────────────────────┼───────────────────────────────────┘ │ │
│  │                            │                                       │ │
│  │                            │                                       │ │
│  └────────────────────────────┼───────────────────────────────────────┘ │
│                               │                                         │
│  ┌────────────────────────────▼───────────────────────────────────────┐ │
│  │                    Security Group                                   │ │
│  │  • Port 22 (SSH)                                                    │ │
│  │  • Port 80 (HTTP)                                                   │ │
│  │  • Port 8080 (Jenkins)                                              │ │
│  │  • Port 30080 (NodePort)                                            │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└────────────────────────────────────────┬─────────────────────────────────┘
                                         │
                                         │ HTTP/HTTPS
                                         ▼
                                ┌────────────────┐
                                │   End Users    │
                                └────────────────┘
```

---

## Component Architecture

### 1. Application Layer (React + Nginx)

```
┌─────────────────────────────────────────┐
│         Docker Container                 │
│  ┌────────────────────────────────────┐ │
│  │  Nginx Web Server (Port 80)        │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  Static Files                 │  │ │
│  │  │  • HTML (index.html)          │  │ │
│  │  │  • JavaScript (React bundle)  │  │ │
│  │  │  • CSS (styles)               │  │ │
│  │  │  • Assets (images, fonts)     │  │ │
│  │  └──────────────────────────────┘  │ │
│  │                                     │ │
│  │  Endpoints:                         │ │
│  │  • GET /         → App             │ │
│  │  • GET /health   → Health check    │ │
│  │  • GET /assets/* → Static files    │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Technology Stack:**
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast HMR, optimized builds)
- **Styling:** Tailwind CSS
- **Web Server:** Nginx Alpine
- **Container:** Docker (multi-stage build)

### 2. Kubernetes Layer

```
Namespace: orgconnect
├── Deployments
│   ├── orgconnect-blue
│   │   ├── Replicas: 2
│   │   ├── Image: yourusername/orgconnect:v1.0
│   │   ├── Resources:
│   │   │   ├── CPU: 100m - 200m
│   │   │   └── Memory: 128Mi - 256Mi
│   │   ├── Health Checks:
│   │   │   ├── Liveness: /health every 10s
│   │   │   └── Readiness: /health every 5s
│   │   └── Labels:
│   │       ├── app: orgconnect
│   │       └── version: blue
│   │
│   └── orgconnect-green
│       ├── Replicas: 2
│       ├── Image: yourusername/orgconnect:v2.0
│       ├── Resources: (same as blue)
│       ├── Health Checks: (same as blue)
│       └── Labels:
│           ├── app: orgconnect
│           └── version: green
│
├── Services
│   ├── orgconnect-blue (ClusterIP)
│   │   └── Selector: version=blue
│   │
│   ├── orgconnect-green (ClusterIP)
│   │   └── Selector: version=green
│   │
│   └── orgconnect-active (NodePort: 30080)
│       └── Selector: version={blue|green}  ◄── Traffic switch here
│
├── Ingress
│   └── orgconnect-ingress
│       ├── Backend: orgconnect-active:80
│       └── Rules: / → orgconnect-active
│
└── ConfigMap
    └── orgconnect-config
        ├── APP_NAME: "OrgConnect"
        └── APP_ENV: "production"
```

### 3. CI/CD Layer (Jenkins)

```
Jenkins Pipeline Stages:
┌──────────────┐
│  1. Checkout │  ← Pull code from GitHub
└──────┬───────┘
       │
┌──────▼─────────────┐
│  2. Build Docker   │  ← docker build -t image:tag .
└──────┬─────────────┘
       │
┌──────▼────────────┐
│  3. Push Registry │  ← docker push image:tag
└──────┬────────────┘
       │
┌──────▼─────────────────┐
│  4. Determine Active   │  ← Check current: blue or green?
└──────┬─────────────────┘
       │
┌──────▼────────────────────┐
│  5. Deploy to Inactive    │  ← Deploy to opposite env
└──────┬────────────────────┘
       │
┌──────▼──────────────┐
│  6. Health Check    │  ← Test new deployment
└──────┬──────────────┘
       │
       │  ┌─────────────┐
       ├──┤ 7. Approval │  ← Manual/Auto approval
       │  └─────────────┘
       │
┌──────▼────────────┐
│  8. Switch Traffic│  ← Patch service selector
└──────┬────────────┘
       │
┌──────▼──────────┐
│  9. Verify      │  ← Post-deployment checks
└──────┬──────────┘
       │
┌──────▼────────────────┐
│  10. Scale Down Old   │  ← Scale down previous version
└───────────────────────┘
```

---

## Network Architecture

### Port Mapping

```
External → AWS Security Group → EC2 Instance → Kubernetes → Pods

Port 22    →  Allow from Your IP  →  SSH            →  N/A        →  N/A
Port 80    →  Allow from 0.0.0.0  →  Forwarded      →  Ingress    →  Pods:80
Port 8080  →  Allow from Your IP  →  Jenkins        →  N/A        →  N/A
Port 30080 →  Allow from 0.0.0.0  →  K8s NodePort   →  Service    →  Pods:80
Port 6443  →  Allow from Self     →  K8s API        →  N/A        →  N/A
```

### Service Discovery

```
Internal DNS Resolution:

orgconnect-blue.orgconnect.svc.cluster.local
  ↓
ClusterIP: 10.96.x.x:80
  ↓
Endpoints: Pod IPs
  • 10.244.0.5:80
  • 10.244.0.6:80

orgconnect-green.orgconnect.svc.cluster.local
  ↓
ClusterIP: 10.96.x.y:80
  ↓
Endpoints: Pod IPs
  • 10.244.0.7:80
  • 10.244.0.8:80

orgconnect-active.orgconnect.svc.cluster.local
  ↓
NodePort: 30080 → ClusterIP: 10.96.x.z:80
  ↓
Routes to either Blue or Green based on selector
```

---

## Deployment Architecture

### Blue-Green State Machine

```
State 1: Blue Active
┌──────────────────────────────────┐
│  Blue (v1.0) ─── ACTIVE ──────┐  │
│    • Replicas: 2              │  │
│    • Receiving traffic        │  │
│                               │  │
│  Green (empty) ─── INACTIVE   │  │
│    • Replicas: 0              │  │
└───────────────────────────────┼──┘
                                │
                    Active Service routes to: blue
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       │                       ▼
    End Users              (Port 30080)            Load Balancer
```

```
State 2: Deploying to Green
┌──────────────────────────────────┐
│  Blue (v1.0) ─── ACTIVE ──────┐  │
│    • Replicas: 2              │  │
│    • Receiving traffic        │  │
│                               │  │
│  Green (v2.0) ── DEPLOYING    │  │
│    • Replicas: 2              │  │
│    • Health checking          │  │
└───────────────────────────────┼──┘
                                │
                    Active Service routes to: blue
                                │
                           (Testing Green)
```

```
State 3: Traffic Switch
┌──────────────────────────────────┐
│  Blue (v1.0) ─── STANDBY ─────┐  │
│    • Replicas: 2              │  │
│    • Ready for rollback       │  │
│                               │  │
│  Green (v2.0) ── ACTIVE ──────┤  │
│    • Replicas: 2              │  │
│    • Receiving traffic        │  │
└───────────────────────────────┼──┘
                                │
                    Active Service routes to: green
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       │                       ▼
    End Users              (Port 30080)            Load Balancer
```

```
State 4: Green Active, Blue Scaled Down
┌──────────────────────────────────┐
│  Blue (v1.0) ─── INACTIVE         │
│    • Replicas: 0                  │
│                                   │
│  Green (v2.0) ── ACTIVE ──────┐  │
│    • Replicas: 2              │  │
│    • Receiving traffic        │  │
└───────────────────────────────┼──┘
                                │
                    Active Service routes to: green
```

### Rollback Process

```
Detect Issue
    │
    ▼
┌─────────────────────┐
│  Immediate Rollback │
│  (< 30 seconds)     │
└──────────┬──────────┘
           │
           ▼
    Patch Service Selector
    version: green → blue
           │
           ▼
    Scale Up Blue
    replicas: 0 → 2
           │
           ▼
    Traffic Routes to Blue
    (Previous stable version)
           │
           ▼
    Investigate Green Issue
```

---

## Security Architecture

### Security Layers

```
Layer 1: AWS Security Groups
├── Inbound Rules
│   ├── SSH (22) ← Your IP only
│   ├── HTTP (80) ← 0.0.0.0/0
│   ├── Jenkins (8080) ← Your IP only
│   ├── NodePort (30080) ← 0.0.0.0/0
│   └── K8s API (6443) ← Self-reference
└── Outbound Rules
    └── All traffic ← 0.0.0.0/0

Layer 2: Kubernetes RBAC
├── Namespace Isolation
│   └── orgconnect namespace
├── Service Accounts
│   ├── default (pods)
│   └── jenkins (deployments)
└── Network Policies
    └── (Optional: Restrict pod-to-pod)

Layer 3: Container Security
├── Non-root User
│   └── nginx runs as nginx user
├── Read-only Filesystem
│   └── /usr/share/nginx/html
├── Resource Limits
│   ├── CPU: 200m max
│   └── Memory: 256Mi max
└── Security Context
    ├── runAsNonRoot: true
    └── readOnlyRootFilesystem: true

Layer 4: Application Security
├── HTTP Headers
│   ├── X-Frame-Options: SAMEORIGIN
│   ├── X-Content-Type-Options: nosniff
│   └── X-XSS-Protection: 1; mode=block
├── HTTPS (optional)
│   └── Via AWS ALB or Let's Encrypt
└── Rate Limiting
    └── Via Nginx or Ingress
```

### Secrets Management

```
Docker Hub Credentials
    ├── Stored in Jenkins Credentials
    ├── Type: Username/Password
    └── ID: docker-credentials

Kubeconfig
    ├── Stored in Jenkins Credentials
    ├── Type: Secret File
    └── ID: kubeconfig

Docker Image Name
    ├── Stored in Jenkins Credentials
    ├── Type: Secret Text
    └── ID: docker-image-name

AWS Credentials (if using ECR)
    ├── Stored in Jenkins Credentials
    ├── Type: AWS Credentials
    └── ID: aws-credentials
```

---

## Data Flow

### Request Flow (Production Traffic)

```
1. User Request
   http://EC2-PUBLIC-IP:30080
        │
        ▼
2. AWS Security Group
   (Allow port 30080)
        │
        ▼
3. EC2 Instance
   iptables/kube-proxy
        │
        ▼
4. Kubernetes Service
   orgconnect-active (NodePort)
        │
        ▼
5. Service Selector Check
   version: blue or green?
        │
        ├─────────┬─────────┐
        ▼         ▼         ▼
    Pod-1     Pod-2     Pod-3
    (Blue)    (Blue)    (Green)
        │         │         │
        └─────────┴─────────┘
                  │
        ▼
6. Nginx serves static files
        │
        ▼
7. Response to User
```

### Deployment Flow

```
1. Developer Commits Code
   git push origin main
        │
        ▼
2. GitHub Webhook/Poll
   Notifies Jenkins
        │
        ▼
3. Jenkins Pipeline Triggered
        │
        ├─▶ Stage 1: Checkout
        │   git clone
        │
        ├─▶ Stage 2: Build
        │   docker build
        │
        ├─▶ Stage 3: Push
        │   docker push to registry
        │
        ├─▶ Stage 4: Determine Active
        │   kubectl get svc (check selector)
        │
        ├─▶ Stage 5: Deploy to Inactive
        │   kubectl apply deployment-{opposite}.yaml
        │
        ├─▶ Stage 6: Health Check
        │   kubectl run curl pod
        │   curl http://service/health
        │
        ├─▶ Stage 7: Approval
        │   Manual approval (optional)
        │
        ├─▶ Stage 8: Switch Traffic
        │   kubectl patch service
        │   selector: version=new
        │
        ├─▶ Stage 9: Verify
        │   Monitor new deployment
        │
        └─▶ Stage 10: Scale Down
            kubectl scale old deployment
                    │
                    ▼
4. Deployment Complete
   New version serving traffic
```

---

## Scalability Considerations

### Horizontal Scaling

```
Current: 2 replicas per environment
         ↓
Can scale to: 10+ replicas
              ↓
Command: kubectl scale deployment/orgconnect-blue --replicas=10
```

### Vertical Scaling

```
Current Resources:
  CPU: 100m request, 200m limit
  Memory: 128Mi request, 256Mi limit

Can increase to:
  CPU: 500m request, 1000m limit
  Memory: 512Mi request, 1Gi limit
```

### Multi-Node Cluster

```
Current: Single-node cluster
         ↓
Can expand to:
  • 1 Master node
  • 2+ Worker nodes
  • Pod anti-affinity for HA
  • Node affinity rules
```

---

## Monitoring & Observability

### Health Checks

```
Liveness Probe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 3

Readiness Probe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

### Metrics (Optional Enhancements)

- **Prometheus:** Metrics collection
- **Grafana:** Visualization
- **ELK Stack:** Log aggregation
- **Jaeger:** Distributed tracing

---

## Disaster Recovery

### Backup Strategy

```
1. Version Control
   • Code in GitHub
   • Config in Git

2. Container Registry
   • Images in Docker Hub
   • Multiple versions tagged

3. Kubernetes State
   • Export manifests
   • kubectl get all -o yaml

4. Data (if applicable)
   • Database backups
   • Persistent volumes
```

### Recovery Procedures

```
Scenario 1: Pod Failure
  → Kubernetes auto-restarts
  → Readiness probe prevents traffic

Scenario 2: Deployment Failure
  → Jenkins rollback stage
  → Switch back to previous version

Scenario 3: Node Failure
  → (Single node: manual intervention)
  → (Multi-node: auto-rescheduling)

Scenario 4: Complete Cluster Failure
  → Re-run init-cluster.sh
  → Apply all manifests
  → Pull images from registry
```

---

## Performance Optimization

### Container Optimization

```
• Multi-stage Docker build
• Alpine Linux base (small size)
• Layer caching
• .dockerignore for faster builds
```

### Kubernetes Optimization

```
• Resource limits prevent noisy neighbors
• Horizontal Pod Autoscaler (HPA)
• Cluster autoscaling (multi-node)
• Pod disruption budgets
```

### Application Optimization

```
• Gzip compression (nginx)
• Asset caching (1 year for static)
• CDN for static assets (optional)
• Lazy loading components
```

---

## Future Enhancements

1. **Canary Deployments**
   - Route 10% traffic to new version
   - Gradually increase if stable

2. **A/B Testing**
   - Route based on user attributes
   - Test multiple versions simultaneously

3. **GitOps**
   - ArgoCD or Flux
   - Git as single source of truth

4. **Service Mesh**
   - Istio or Linkerd
   - Advanced traffic management

5. **Multi-Region**
   - Deploy across AWS regions
   - Global load balancing

---

This architecture provides a solid foundation for modern cloud-native applications with zero-downtime deployments and easy rollback capabilities.

