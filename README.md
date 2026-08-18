# ZeroBroker

**A brokerage-free property marketplace platform** — Connect property owners directly with renters and buyers. Zero agent fees. Owner-direct listings.

Built with **Kubernetes + GitHub Actions CI/CD + ArgoCD + Prometheus/Grafana Monitoring**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Quick Start](#quick-start)
- [Backend Services](#backend-services)
- [Frontend Application](#frontend-application)
- [Configuration](#configuration)
- [Kubernetes Deployment](#kubernetes-deployment)
- [ArgoCD Setup](#argocd-setup)
- [Monitoring & Alerting](#monitoring--alerting)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Testing](#testing)

---

## 🎯 Overview

ZeroBroker is a **production-ready microservices platform** for a property marketplace that eliminates traditional brokerage fees. Built on a modern **GitOps architecture** with Kubernetes, GitHub Actions CI/CD, and ArgoCD deployment automation.

The platform features:

- **Zero Brokerage** — Owner-direct listings with no agent fees
- **Location-Based Search** — Filter by city, locality, bedrooms, and price range
- **Dual Marketplace** — Separate flows for rentals and property purchases
- **User Authentication** — Secure signup and signin for property owners
- **Property Management** — Upload and manage rental or buy listings
- **Microservices Architecture** — Specialized backend services for each domain
- **Automated CI/CD** — GitHub Actions with intelligent change detection
- **GitOps Deployment** — ArgoCD automatically syncs manifests to K8s
- **Full Observability** — Prometheus metrics, Grafana dashboards, Discord alerts
- **Multi-Architecture** — Build for both amd64 and arm64 platforms

---

## 🏗️ Architecture

### High-Level Flow

```
Git Push → GitHub Actions → Build & Push → Update K8s Manifests
                               ↓
                           Docker Hub
                               
                           ArgoCD Watches
                               ↓
                           Kubernetes Cluster
                               ↓
                           Services Running
                               ↓
                           Prometheus Scrapes
                               ↓
                           Grafana Displays
                               ↓
                           Alertmanager Fires → Discord
```

### Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Git Repository                          │
│  Push to master triggers GitHub Actions CI/CD                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              GitHub Actions CI/CD Pipeline                      │
│                                                                 │
│  1. DETECT: Changed files in frontend/, backend-*/, etc.       │
│  2. BUILD: Multi-architecture Docker images (amd64, arm64)      │
│  3. PUSH: Images to Docker Hub with commit SHA tag             │
│  4. UPDATE: K8s manifests with new image tags                  │
│  5. COMMIT: GitOps changes back to repository                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ Manifests pushed to repo
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ArgoCD (UI)                                │
│                                                                 │
│  • Watches k8s/ directory in Git                               │
│  • Detects manifest changes                                    │
│  • Syncs desired state to Kubernetes                           │
│  • Provides UI for deployment management                       │
│  • Application health monitoring                               │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                            │
│            (Kind for dev, Production for stage/prod)           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Namespace: zero-broker                                 │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  Frontend    │  │    Auth      │  │    Home      │  │   │
│  │  │   (Nginx)    │  │  (Port 5000) │  │ (Port 4001)  │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │     Rent     │  │      Buy     │  │    Search    │  │   │
│  │  │ (Port 4002)  │  │ (Port 4003)  │  │ (Port 4004)  │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Traefik Ingress Controller (Port: 30080)          │ │   │
│  │  │ Routes traffic to backend services                │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             Monitoring Stack                            │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ Prometheus   │  │   Grafana    │  │ Alertmanager │  │   │
│  │  │ (Scrapes     │  │  (Visualize  │  │   (Sends     │  │   │
│  │  │  metrics)    │  │   metrics)   │  │   alerts)    │  │   │
│  │  └──────────────┘  └──────────────┘  └──────┬───────┘  │   │
│  │                                             │           │   │
│  └─────────────────────────────────────────────┼───────────┘   │
│                                                │                │
└────────────────────────────────────────────────┼────────────────┘
                                                 │
                                                 │ Discord Webhooks
                                                 ▼
                                        Discord Channels
                                  (#critical-alerts, #warnings)
                                         
                                      MongoDB Atlas
                                   (External Database)
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas (cloud)
- **Validation**: Zod
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Testing**: Vitest + Supertest

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router 6
- **Deployment**: Nginx

### CI/CD & Infrastructure
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions (automated builds on git push)
- **Change Detection**: Dorny paths-filter
- **GitOps**: ArgoCD (automated K8s sync)
- **Containerization**: Docker (multi-arch: linux/amd64, linux/arm64)
- **Image Registry**: Docker Hub
- **Orchestration**: Kubernetes
- **Local K8s**: Kind (Kubernetes in Docker)
- **Ingress**: Traefik
- **Helm**: Package management for Kubernetes

### Monitoring & Observability
- **Metrics Collection**: Prometheus (scrapes from services)
- **Dashboards**: Grafana (visualizes metrics)
- **Alerting**: Alertmanager (evaluates alert rules)
- **Notifications**: Discord webhooks (critical & warning alerts)

---

## 📁 Project Structure

```
zerobroker/
├── backend/                    # Main backend service (ports 4000)
│   ├── src/
│   │   ├── app.ts            # Express app with API routes
│   │   ├── index.ts          # Server startup
│   │   ├── services/         # Business logic layer
│   │   ├── db/               # Database connections
│   │   ├── data/             # Seed data
│   │   ├── types/            # TypeScript types
│   │   └── scripts/          # Database seeding
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── backend-auth/               # Authentication service (port 5000)
│   ├── src/
│   │   ├── app.ts            # Auth endpoints (signup/signin)
│   │   ├── services/         # Auth business logic
│   │   └── db/               # MongoDB connection
│   └── Dockerfile
│
├── backend-home/               # Home page service (port 4001)
│   ├── src/
│   │   ├── app.ts            # Featured properties & cities
│   │   └── services/         # Data retrieval logic
│   └── Dockerfile
│
├── backend-rent/               # Rental listings service (port 4002)
│   ├── src/
│   │   ├── app.ts            # Rent property CRUD
│   │   ├── services/         # Property management logic
│   │   └── uploads/          # Image storage
│   └── Dockerfile
│
├── backend-buy/                # Buy listings service (port 4003)
│   ├── src/
│   │   ├── app.ts            # Buy property CRUD
│   │   ├── services/         # Property management logic
│   │   └── uploads/          # Image storage
│   └── Dockerfile
│
├── backend-search/             # Search service (port 4004)
│   ├── src/
│   │   ├── app.ts            # Unified search across listings
│   │   └── services/         # Search & filter logic
│   └── Dockerfile
│
├── front-end/                  # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API client services
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # Utility functions
│   ├── home-app/             # Home section micro-app
│   ├── rent-app/             # Rent section micro-app
│   ├── buy-app/              # Buy section micro-app
│   ├── search-app/           # Search section micro-app
│   ├── auth-app/             # Auth section micro-app
│   ├── vite.config.ts
│   ├── nginx.conf
│   └── Dockerfile
│
├── k8s/                        # Kubernetes manifests
│   ├── namespace/             # Namespace configuration
│   ├── backend/               # Backend service deployments
│   ├── frontend/              # Frontend deployment
│   ├── ingress/               # Traefik ingress routes
│   ├── secrets/               # MongoDB credentials
│   └── monitoring/            # Prometheus/Alertmanager configs
│
├── docker-compose.yml         # Local development setup
├── .env.example               # Environment variables template
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker
- kubectl
- Kind cluster
- GitHub repository with secrets configured
- Docker Hub account (for image registry)

### Option 1: Local Development (Without Containers)

```bash
# Clone the repository
git clone <repository-url>
cd zerobroker

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and other settings

# Install dependencies for all services
npm install
cd backend && npm install && cd ..
cd backend-auth && npm install && cd ..
cd backend-home && npm install && cd ..
cd backend-rent && npm install && cd ..
cd backend-buy && npm install && cd ..
cd backend-search && npm install && cd ..
cd front-end && npm install && cd ..

# Start services (in separate terminals)
cd backend && npm run dev              # Port 4000
cd backend-auth && npm run dev         # Port 5000
cd backend-home && npm run dev         # Port 4001
cd backend-rent && npm run dev         # Port 4002
cd backend-buy && npm run dev          # Port 4003
cd backend-search && npm run dev       # Port 4004
cd front-end && npm run dev            # Port 5173
```

### Option 2: Using GitHub Actions + ArgoCD + K8s (Recommended for Production)

This is the primary deployment method. Simply push to master and let the automated pipeline handle everything:

```bash
# 1. Configure GitHub Secrets (in repository settings)
#    Required secrets:
#    - DOCKER_USERNAME: Your Docker Hub username
#    - DOCKER_PASSWORD: Your Docker Hub access token

# 2. Push to master (any changes to backend/, front-end/, etc.)
git push origin master

# 3. GitHub Actions automatically:
#    - Detects changed services
#    - Builds Docker images (multi-arch)
#    - Pushes to Docker Hub
#    - Updates K8s manifests with new tags
#    - Commits back to repository

# 4. ArgoCD automatically:
#    - Detects manifest changes
#    - Syncs changes to Kubernetes cluster
#    - Deploys new images
#    - Shows status in ArgoCD UI
```

Access the application at:
- **ArgoCD UI**: http://argocd.local:30080 (or configured domain)
- **Application**: http://zerobroker.local:30080 (or configured domain)
- **Grafana**: http://grafana.local:30080 (or configured domain)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline is defined in `.github/workflows/ci_cd.yaml` and executes on every push to `master` branch.

#### Pipeline Stages

**1. Change Detection** (`changes` job)
- Detects which services changed using [dorny/paths-filter](https://github.com/dorny/paths-filter)
- Monitors these paths:
  - `front-end/**` → triggers frontend build
  - `backend/**` → triggers backend build
  - `backend-auth/**` → triggers auth service build
  - `backend-buy/**` → triggers buy service build
  - `backend-home/**` → triggers home service build
  - `backend-rent/**` → triggers rent service build
  - `backend-search/**` → triggers search service build

**2. Build & Push** (`build-and-push` job)
- Only runs for changed services (parallel builds, max 4 concurrent)
- For each changed service:
  - Sets up QEMU and Docker Buildx for multi-architecture support
  - Authenticates with Docker Hub
  - Builds Docker images for:
    - `linux/amd64` (Intel/AMD 64-bit)
    - `linux/arm64` (ARM 64-bit)
  - Tags image: `$DOCKER_USERNAME/$SERVICE_NAME:$COMMIT_SHA`
  - Pushes to Docker Hub
  - Caches layers in GitHub Actions cache

**3. GitOps Update** (`update-gitops` job)
- Updates K8s manifests with new image tags
- For each changed service:
  - Reads the deployment manifest
  - Replaces old image tag with new commit SHA
  - Example: `myregistry/frontend:abc123def` → `myregistry/frontend:def456ghi`
- Commits manifest changes back to repository
- Triggers ArgoCD to detect and sync changes

### Example Workflow Execution

```
$ git commit -m "Update home page styling"
$ git push origin master

# GitHub Actions Logs:
[changes] Detected: frontend changed
[build-and-push] Building frontend:7a8b9c0d (linux/amd64, linux/arm64)
[build-and-push] Pushing to Docker Hub: myuser/frontend:7a8b9c0d
[update-gitops] Updated k8s/frontend/deployment.yaml
[update-gitops] Committed: "chore(gitops): update images to 7a8b9c0d"

# ArgoCD (watching k8s/ branch):
[ArgoCD] Detected manifest changes
[ArgoCD] Syncing: myuser/frontend:7a8b9c0d
[ArgoCD] Deployment successful

# Application:
New version now running in Kubernetes
```

### Concurrency Control

- Only one GitOps update runs per branch at a time
- In-progress runs are cancelled when new push arrives
- Prevents race conditions in manifest updates

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker
- kubectl
- Kind cluster
- GitHub repository with secrets configured
- Docker Hub account (for image registry)

### Option 1: Local Development (Without Containers)

```bash
# Clone the repository
git clone <repository-url>
cd zerobroker

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and other settings

# Install dependencies for all services
npm install
cd backend && npm install && cd ..
cd backend-auth && npm install && cd ..
cd backend-home && npm install && cd ..
cd backend-rent && npm install && cd ..
cd backend-buy && npm install && cd ..
cd backend-search && npm install && cd ..
cd front-end && npm install && cd ..

# Start services (in separate terminals)
cd backend && npm run dev              # Port 4000
cd backend-auth && npm run dev         # Port 5000
cd backend-home && npm run dev         # Port 4001
cd backend-rent && npm run dev         # Port 4002
cd backend-buy && npm run dev          # Port 4003
cd backend-search && npm run dev       # Port 4004
cd front-end && npm run dev            # Port 5173
```

### Option 2: Docker Compose Setup (For Local Testing)

```bash
# Create environment file
cp .env.example .env
# Update MONGODB_URI in .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Once running, the application is accessible at:
- **Frontend**: http://localhost (or http://localhost:3000 for Vite dev)
- **Backend APIs**: http://localhost:4000-4004, http://localhost:5000

### Option 3: Kubernetes + ArgoCD (Production)

See [Kubernetes Deployment](#kubernetes-deployment) and [ArgoCD Setup](#argocd-setup) sections below.

---

## 🔧 Backend Services

### Overview

| Service | Port | Purpose |
|---------|------|---------|
| `backend` | 4000 | Main API with property listings, search, and details |
| `backend-auth` | 5000 | User authentication (signup/signin) |
| `backend-home` | 4001 | Home page with featured properties and city list |
| `backend-rent` | 4002 | Rental property management (create, read, upload images) |
| `backend-buy` | 4003 | Buy property management (create, read, upload images) |
| `backend-search` | 4004 | Unified search across all property listings |

### Key Features

**Express.js Stack**
- Helmet: Security headers
- CORS: Cross-origin requests
- Morgan: HTTP logging
- Zod: Input validation
- Async error handling with wrapper functions

**Database**
- MongoDB Atlas for cloud persistence
- Environment-driven connection strings
- Service layer for clean architecture

**Error Handling**
- Centralized error middleware
- Zod schema validation on all endpoints
- Proper HTTP status codes

---

## 🎨 Frontend Application

### Structure

The frontend is built with React and organized into multiple Vite apps:

- **Home App** (`home-app/`) — Landing page with featured properties and city selection
- **Rent App** (`rent-app/`) — Browse and filter rental properties
- **Buy App** (`buy-app/`) — Browse and filter properties for purchase
- **Search App** (`search-app/`) — Unified search interface
- **Auth App** (`auth-app/`) — User signup and signin

### Configuration

Backend service URLs are configured via environment variables:

```
VITE_HOME_BASE_URL=http://localhost:4001
VITE_RENT_BASE_URL=http://localhost:4002
VITE_BUY_BASE_URL=http://localhost:4003
VITE_SEARCH_BASE_URL=http://localhost:4004
VITE_AUTH_BASE_URL=http://localhost:5000
```

### Features

- Location-based search with filters (city, price range, bedrooms)
- Responsive design with Tailwind CSS (implied by structure)
- Offline fallbacks for graceful degradation
- Client-side routing with React Router
- Type-safe API calls

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root (use `.env.example` as template):

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/zero_broker?retryWrites=true&w=majority
MONGODB_DB_NAME=zero_broker

# Server Configuration
HOST=0.0.0.0

# Service Ports (optional, defaults are used if omitted)
AUTH_PORT=5000
HOME_PORT=4001
RENT_PORT=4002
BUY_PORT=4003
SEARCH_PORT=4004

# Frontend Configuration (used during build)
VITE_HOME_BASE_URL=http://localhost:4001
VITE_RENT_BASE_URL=http://localhost:4002
VITE_BUY_BASE_URL=http://localhost:4003
VITE_SEARCH_BASE_URL=http://localhost:4004
VITE_AUTH_BASE_URL=http://localhost:5000
```

### MongoDB Setup

**Option 1: MongoDB Atlas (Cloud)**
1. Create an account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and database user
3. Get the connection string
4. Set `MONGODB_URI` in `.env`

**Option 2: Local MongoDB**
```bash
# Using Docker
docker run -d -p 5001:27017 mongo:latest

# Connection string
MONGODB_URI=mongodb://localhost:5001/zero_broker
```

---

## 🐳 Docker Compose Setup

### Start All Services

```bash
docker-compose up -d
```

### Service Ports (Docker Compose)

- Frontend: `http://localhost` (Nginx reverse proxy)
- Backend: `http://localhost:4000`
- Auth: `http://localhost:5000`
- Home: `http://localhost:4001`
- Rent: `http://localhost:4002`
- Buy: `http://localhost:4003`
- Search: `http://localhost:4004`

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend-auth
```

### Stop Services

```bash
docker-compose down
```

---

## ☸️ Kubernetes Deployment

### Prerequisites

- `kubectl` configured to access your cluster
- Helm 3+
- Kind cluster (or any K8s cluster)
- ArgoCD installed and configured
- Traefik Ingress Controller

### 1. Create Namespace

```bash
kubectl apply -f k8s/namespace/namespace.yaml
```

### 2. Set MongoDB Credentials

Edit `k8s/secrets/mongo-secret-example.yaml` with your MongoDB credentials:

```bash
kubectl apply -f k8s/secrets/mongo-secret-example.yaml
```

### 3. Install Traefik Ingress Controller

```bash
# Add Helm repository
helm repo add traefik https://helm.traefik.io/traefik
helm repo update

# Install Traefik
helm install traefik traefik/traefik \
  --namespace zero-broker \
  --set ports.web.nodePort=30080 \
  --set service.type=NodePort
```

### 4. Deploy Services with ArgoCD

Instead of manually applying manifests, use ArgoCD to manage deployments (see [ArgoCD Setup](#argocd-setup)).

However, if deploying manually:

```bash
# Deploy backend services
kubectl apply -f k8s/backend/k8s-auth/
kubectl apply -f k8s/backend/k8s-home/
kubectl apply -f k8s/backend/k8s-rent/
kubectl apply -f k8s/backend/k8s-buy/
kubectl apply -f k8s/backend/k8s-search/

# Deploy frontend
kubectl apply -f k8s/frontend/

# Configure ingress
kubectl apply -f k8s/ingress/ingress.yaml
```

### 5. Verify Deployment

```bash
# Check all resources
kubectl get all -n zero-broker

# Check pods
kubectl get pods -n zero-broker

# Check services
kubectl get svc -n zero-broker

# Check ingress
kubectl get ingress -n zero-broker

# View pod logs
kubectl logs -n zero-broker <pod-name>

# Describe a service
kubectl describe svc -n zero-broker backend-auth
```

### 6. Test Services from Inside Cluster

```bash
# Create a test pod
kubectl run test --image=curlimages/curl -it --rm -n zero-broker -- sh

# Inside the pod, test endpoints
curl http://backend-auth:5000/health
curl http://backend-home:4001/health
curl http://backend-rent:4002/health
curl http://backend-buy:4003/health
curl http://backend-search:4004/health
curl http://zerobroker-frontend-service:80
```

### Access the Application

Update `/etc/hosts`:
```
<YOUR_NODE_IP> zerobroker.local
```

Then access: `http://zerobroker.local:30080`

---

## 🔀 ArgoCD Setup

### What is ArgoCD?

ArgoCD is a **declarative GitOps continuous delivery tool** that:
- Watches your Git repository for manifest changes
- Automatically syncs Kubernetes cluster state to Git state
- Provides a UI to visualize and manage deployments
- Enables automated deployment without manual `kubectl apply`

### Installation

```bash
# 1. Create argocd namespace
kubectl create namespace argocd

# 2. Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. Wait for ArgoCD to be ready
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# 4. Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# 5. Port-forward to access UI (optional for local testing)
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access UI at: http://localhost:8080
# Username: admin
# Password: <from step 4>
```

### Configure ArgoCD for ZeroBroker

**Create ArgoCD Application Resource:**

```yaml
# Create a file: argocd/application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: zerobroker
  namespace: argocd
spec:
  project: default
  
  source:
    repoURL: https://github.com/YOUR_USERNAME/zerobroker
    targetRevision: master
    path: k8s/
  
  destination:
    server: https://kubernetes.default.svc
    namespace: zero-broker
  
  syncPolicy:
    automated:
      prune: true      # Delete resources no longer in Git
      selfHeal: true   # Revert manual K8s changes
    syncOptions:
    - CreateNamespace=true
```

Apply the application:
```bash
kubectl apply -f argocd/application.yaml
```

### How It Works in Our Pipeline

1. **Developer pushes to master** → Git repository updated
2. **GitHub Actions runs** → CI/CD pipeline executes
3. **Images built & pushed** → Docker Hub updated
4. **Manifests updated** → K8s deployment.yaml files changed
5. **Changes committed back** → Git repository updated again
6. **ArgoCD watches** → Detects manifest changes in `k8s/` directory
7. **ArgoCD syncs** → Applies manifests to Kubernetes cluster
8. **Application updates** → New image deployed and running

### ArgoCD UI Features

```
http://argocd.local:30080

Dashboard:
├── Applications
│   └── zerobroker
│       ├── Source (Git repo & branch)
│       ├── Destination (K8s cluster & namespace)
│       ├── Status (Synced/OutOfSync)
│       ├── Health (Healthy/Progressing/Degraded)
│       ├── Resources (Services, Deployments, Pods)
│       └── Logs (Sync logs)
│
├── Manual Sync Button
├── Refresh Button (check Git for changes)
└── Delete Application
```

### Troubleshooting ArgoCD

```bash
# Check ArgoCD server status
kubectl get pods -n argocd

# Check application status
kubectl get application -n argocd

# Describe application for details
kubectl describe application zerobroker -n argocd

# View ArgoCD server logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server

# View ArgoCD controller logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller

# View ArgoCD repo server logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-repo-server

# Manually sync (if automated sync is disabled)
argocd app sync zerobroker
```

---

## 📊 Monitoring & Alerting

### Monitoring Stack

The project includes Prometheus for metrics collection, Grafana for visualization, and Alertmanager for sending alerts to Discord.

#### Prometheus

Prometheus scrapes metrics from all services:

```bash
# Get Prometheus UI (if exposed)
kubectl port-forward -n zero-broker svc/prometheus 9090:9090

# Access at: http://localhost:9090
```

**Metrics collected:**
- HTTP request rates, latencies, and error rates
- Pod CPU and memory usage
- Database connection pools
- Custom application metrics

#### Grafana

Grafana provides dashboards to visualize metrics:

```bash
# Get Grafana password
kubectl get secret -n zero-broker grafana-admin -o jsonpath="{.data.admin-password}" | base64 -d

# Port-forward to Grafana
kubectl port-forward -n zero-broker svc/grafana 3000:80

# Access at: http://localhost:3000
# Username: admin
# Password: <from above>
```

**Built-in dashboards:**
- Kubernetes cluster overview
- Pod and container metrics
- Node resource usage
- Network traffic analysis

#### Alertmanager & Discord Integration

Alertmanager is configured to send alerts to Discord channels:

**Setup Discord Webhook:**

1. Create Discord server/channel
2. Create webhook in channel settings
3. Copy webhook URL
4. Add to `k8s/monitoring/alertmanager-values.yaml`:

```yaml
receivers:
  - name: discord-critical
    discord_configs:
      - webhook_url: "https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
        title: "🚨 Critical Alert"
        
  - name: discord-warning
    discord_configs:
      - webhook_url: "https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
        title: "⚠️ Warning Alert"
```

**Alert Routing Rules:**

```yaml
route:
  routes:
    - matchers:
        - app_namespace="zero-broker"
        - severity="critical"
      receiver: discord-critical
      
    - matchers:
        - app_namespace="zero-broker"
        - severity="warning"
      receiver: discord-warning
```

**Alert Types:**

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| PodCrashLoop | Pod crashes repeatedly | Critical | 🚨 critical |
| HighMemory | Memory > 90% | Warning | ⚠️ warnings |
| HighCPU | CPU > 80% | Warning | ⚠️ warnings |
| ServiceDown | Service unreachable | Critical | 🚨 critical |
| DatabaseLatency | Query latency spike | Warning | ⚠️ warnings |

### Deployment Instructions

```bash
# Install Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  -n zero-broker \
  -f k8s/monitoring/prometheus-values.yaml

# Install Alertmanager with Discord webhook
helm install alertmanager prometheus-community/alertmanager \
  -n zero-broker \
  -f k8s/monitoring/alertmanager-values.yaml

# Apply monitoring endpoints
kubectl apply -f k8s/monitoring/endpoint-monitoring.yaml
```

### Accessing Monitoring Stack

```bash
# Prometheus
kubectl port-forward -n zero-broker svc/prometheus 9090:9090
# Access: http://localhost:9090

# Grafana  
kubectl port-forward -n zero-broker svc/grafana 3000:80
# Access: http://localhost:3000

# Alertmanager
kubectl port-forward -n zero-broker svc/alertmanager 9093:9093
# Access: http://localhost:9093
```

### Discord Alert Example

```
🚨 Critical Alert
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Alert: PodCrashLooping
Namespace: zero-broker
Affected Pod: backend-auth-deployment-abc123
Severity: Critical
Summary: Pod has restarted 5 times in 10 minutes
Description: Pod is in a crash loop. Check logs for errors.

⚠️ Warning Alert
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Alert: HighMemoryUsage
Namespace: zero-broker
Affected Pod: backend-rent-deployment-xyz789
Severity: Warning
Summary: Memory usage at 92%
Description: Consider increasing memory limit or checking for leaks.
```

---

## 📡 API Endpoints

### Authentication Service (Port 5000)

```
POST   /api/auth/signup          Sign up a new user
POST   /api/auth/signin          Sign in existing user
GET    /health                   Health check
```

### Home Service (Port 4001)

```
GET    /api/home/featured        Get featured properties
GET    /api/home/cities          Get list of available cities
GET    /health                   Health check
```

### Rent Service (Port 4002)

```
GET    /api/rent                 List rental properties
POST   /api/rent                 Create rental property
GET    /api/rent/:id             Get rental property details
PUT    /api/rent/:id             Update rental property
DELETE /api/rent/:id             Delete rental property
GET    /uploads/:filename        Serve uploaded images
GET    /health                   Health check
```

### Buy Service (Port 4003)

```
GET    /api/buy                  List buy properties
POST   /api/buy                  Create buy property
GET    /api/buy/:id              Get property details
PUT    /api/buy/:id              Update property
DELETE /api/buy/:id              Delete property
GET    /uploads/:filename        Serve uploaded images
GET    /health                   Health check
```

### Search Service (Port 4004)

```
GET    /api/search              Search across all properties
GET    /api/search?id=...       Get specific property by ID
GET    /health                  Health check
```

#### Query Parameters

All search endpoints support:
- `query` — Text search in property name/description
- `city` — Filter by city
- `type` — Filter by type (rent, buy, all)
- `minPrice` — Minimum price filter
- `maxPrice` — Maximum price filter
- `bedrooms` — Number of bedrooms
- `page` — Pagination (default: 1)
- `limit` — Results per page (default: 12, max: 100)

#### Example Requests

```bash
# Search for rentals in Mumbai under $500
curl "http://localhost:4004/api/search?city=Mumbai&type=rent&maxPrice=500"

# Get featured properties for home page
curl "http://localhost:4001/api/home/featured?limit=8"

# Create a new rental listing
curl -X POST "http://localhost:4002/api/rent" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Modern 2BHK Apartment",
    "city": "Mumbai",
    "price": 45000,
    "bedrooms": 2,
    "image": "data:image/png;base64,..."
  }'
```

---

## 🔨 Development

### Scripts

**Backend Services** (each service directory):
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run compiled JavaScript
npm test             # Run tests with Vitest
npm run seed:atlas   # Seed MongoDB with sample data (backend only)
```

**Frontend**:
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run dev:home     # Run home-app separately
npm run dev:rent     # Run rent-app separately
npm run dev:buy      # Run buy-app separately
npm run dev:search   # Run search-app separately
npm run dev:auth     # Run auth-app separately
```

### Hot Reload

All services support hot reload during development:
- Backend: `npm run dev` uses `tsx watch`
- Frontend: `npm run dev` uses Vite's built-in HMR

### Code Structure Best Practices

- **Services Layer**: Business logic separated from routes
- **Zod Validation**: All inputs validated before processing
- **Error Handling**: Async handlers with centralized error middleware
- **Type Safety**: Full TypeScript coverage
- **CORS & Security**: Helmet and CORS middleware enabled by default

---

## 🧪 Testing

### Backend Tests

Each backend service includes Vitest + Supertest:

```bash
cd backend
npm test                 # Run all tests
npm test -- --watch     # Run in watch mode
npm test -- --coverage  # Generate coverage report
```

### Frontend Tests

Add test files alongside components:

```bash
cd front-end
npm test                # Run all tests (requires test setup)
```

### Example Test (Backend)

```typescript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app'

describe('GET /health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
```

---

## 🚢 Production Deployment

### Docker Build

```bash
# Build all services
docker-compose build

# Build specific service
docker build -t zerobroker-backend ./backend
```

### Kubernetes Deployment

See the [Kubernetes Deployment](#kubernetes-deployment) section above for full instructions.

### Environment Variables for Production

```env
# Use MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/zero_broker?retryWrites=true&w=majority

# Use production domain
VITE_HOME_BASE_URL=https://zerobroker.com/api/home
VITE_RENT_BASE_URL=https://zerobroker.com/api/rent
VITE_BUY_BASE_URL=https://zerobroker.com/api/buy
VITE_SEARCH_BASE_URL=https://zerobroker.com/api/search
VITE_AUTH_BASE_URL=https://zerobroker.com/api/auth
```

---

## 📊 Monitoring

The project includes Prometheus and Alertmanager configurations:

```bash
# Apply monitoring stack
kubectl apply -f monitoring/endpoint-monitoring.yaml
kubectl apply -f monitoring/alertmanager-values.yaml
kubectl apply -f monitoring/monitoring-ingress.yaml
```

---

## 🐛 Troubleshooting

### Services Not Connecting

1. **Docker Compose**: Ensure all services are on the same network
   ```bash
   docker-compose logs <service-name>
   ```

2. **Kubernetes**: Check service discovery
   ```bash
   kubectl get svc -n zero-broker
   kubectl describe svc <service-name> -n zero-broker
   ```

### MongoDB Connection Issues

```bash
# Test connection string locally
mongosh "<MONGODB_URI>"

# Verify credentials are correct in .env
```

### Frontend API Errors

1. Check backend service is running: `curl http://localhost:4000/health`
2. Verify environment variables in `front-end/.env`
3. Check browser console for CORS errors

### Traefik Ingress Not Working

```bash
# Check Traefik status
kubectl get pods -n zero-broker -l app.kubernetes.io/name=traefik

# Check logs
kubectl logs -n zero-broker -l app.kubernetes.io/name=traefik

# Verify Ingress configuration
kubectl describe ingress -n zero-broker
```

---

## 📝 License

[Add your license here]

---

## 🤝 Contributing

[Add contribution guidelines here]

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation and troubleshooting section
- Review logs: `kubectl logs -n zero-broker <pod-name>`

---

## 🎓 Deployment Workflow Summary

### Development → Production Pipeline

```
Developer (Local Machine)
    ↓
git commit & git push master
    ↓
GitHub Actions Triggers
    ├─ Detects changed files (paths-filter)
    ├─ Builds multi-arch Docker images
    ├─ Pushes to Docker Hub
    └─ Updates K8s manifests
    ↓
Git Repository Updated
    ↓
ArgoCD Detects Changes
    ├─ Compares Git vs Cluster state
    ├─ Shows sync status in UI
    └─ Auto-syncs changes
    ↓
Kubernetes Deployment
    ├─ Pulls new images from Docker Hub
    ├─ Starts new pods
    ├─ Terminates old pods
    └─ Health checks pass
    ↓
Application Running
    ↓
Prometheus/Grafana Monitoring
    └─ Collects metrics
    └─ Displays dashboards
    └─ Fires alerts to Discord
```

### Key URLs & Access

| Component | URL | Default Port | Credentials |
|-----------|-----|--------------|-------------|
| Application | http://zerobroker.local | 30080 | Public |
| ArgoCD | http://argocd.local | 30080 | admin / generated-password |
| Grafana | http://grafana.local | 30080 | admin / admin |
| Prometheus | http://prometheus.local | 9090 | Public |
| Alertmanager | http://alertmanager.local | 9093 | Public |

---

**Built with ❤️ using Kubernetes, GitHub Actions, ArgoCD, and Prometheus**

[Add support/contact information here]