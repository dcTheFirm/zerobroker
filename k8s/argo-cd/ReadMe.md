# Argo CD GitOps Deployment

This document explains the GitOps-based CI/CD setup for ZeroBroker using **GitHub Actions, Docker Hub, Argo CD, and K3s**.

---

## Architecture

```text
Developer
    │
    │ git push
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    ├── Build Docker images
    ├── Push images to Docker Hub
    └── Update Kubernetes image tags
            │
            │ git commit + push
            ▼
      GitHub Repository
            │
            │ Argo CD watches
            ▼
         Argo CD
            │
            │ Sync
            ▼
           K3s
            │
            ▼
       Kubernetes Pods
```

### Responsibilities

| Component      | Responsibility                             |
| -------------- | ------------------------------------------ |
| GitHub         | Source code and Kubernetes desired state   |
| GitHub Actions | CI: build, test, scan and push images      |
| Docker Hub     | Container image registry                   |
| Argo CD        | CD: synchronize Git with Kubernetes        |
| K3s            | Kubernetes cluster running the application |

---

# 1. GitOps Workflow

When code is pushed:

```bash
git push origin CI-CD
```

GitHub Actions performs the following:

1. Checkout source code.
2. Build Docker images.
3. Push Docker images to Docker Hub.
4. Tag images using the Git commit SHA.
5. Update Kubernetes manifests with the new image SHA.
6. Commit the updated manifests back to GitHub.

Example:

```yaml
image: dcthefirm/backend:OLD_SHA
```

becomes:

```yaml
image: dcthefirm/backend:NEW_SHA
```

Argo CD detects the Git change and synchronizes the new desired state to the K3s cluster.

---

# 2. Repository Structure

Current Kubernetes structure:

```text
k8s/
├── backend/
│   ├── k8s-auth/
│   │   ├── auth-configmap.yaml
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── k8s-buy/
│   │   ├── buy-configmap.yaml
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── k8s-home/
│   │   ├── deployment.yaml
│   │   ├── home-configmap.yaml
│   │   └── service.yaml
│   │
│   ├── k8s-rent/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   └── k8s-search/
│       ├── deployment.yaml
│       └── service.yaml
│
├── frontend/
│   ├── configmap.yaml
│   ├── deployment.yaml
│   └── service.yaml
│
├── ingress/
│   └── ingress.yaml
│
├── namespace/
│   └── namespace.yaml
│
└── secrets/
    └── mongo-secret-example.yaml
```

---

# 3. Docker Image Versioning

Images are tagged using the Git commit SHA.

Example:

```text
dcthefirm/frontend:4e1e9c3e03e27e2a95724f13f8cb24a231108c5a
dcthefirm/backend:4e1e9c3e03e27e2a95724f13f8cb24a231108c5a
dcthefirm/backend-auth:4e1e9c3e03e27e2a95724f13f8cb24a231108c5a
```

This provides immutable image references.

Avoid using:

```text
latest
testing
dev
```

for production deployments.

---

# 4. GitHub Actions

GitHub Actions is responsible for CI and publishing the desired Kubernetes state.

The workflow performs:

```text
Source Code
    ↓
Docker Build
    ↓
Docker Image
    ↓
Docker Hub
    ↓
Update K8s Manifest
    ↓
Git Commit
    ↓
GitHub
```

GitHub Actions does **not** SSH into the K3s VM.

The deployment responsibility belongs to Argo CD.

---

# 5. Install Argo CD on K3s

SSH into the K3s VM.

Verify the cluster:

```bash
sudo k3s kubectl get nodes
```

The node should show:

```text
STATUS
Ready
```

Create the Argo CD namespace:

```bash
sudo k3s kubectl create namespace argocd
```

Install Argo CD:

```bash
sudo k3s kubectl apply \
  -n argocd \
  --server-side \
  --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

# 6. Verify Argo CD

Check Argo CD pods:

```bash
sudo k3s kubectl get pods -n argocd
```

Check services:

```bash
sudo k3s kubectl get svc -n argocd
```

Wait until the Argo CD components are running.

---

# 7. Access Argo CD

For initial testing, use port forwarding:

```bash
sudo k3s kubectl port-forward \
  svc/argocd-server \
  -n argocd \
  8080:443 \
  --address 0.0.0.0
```

Then open:

```text
https://<K3S-VM-IP>:8080
```

The browser may show a certificate warning because the default Argo CD installation uses a self-signed certificate.

---

# 8. Get Argo CD Admin Password

Run:

```bash
sudo k3s kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

Default username:

```text
admin
```

The command output is the initial password.

---

# 9. Argo CD Application

Create an Argo CD Application that points to the GitHub repository.

Example:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application

metadata:
  name: zerobroker
  namespace: argocd

spec:
  project: default

  source:
    repoURL: https://github.com/dcthefirm/zerobroker.git
    targetRevision: CI-CD
    path: k8s

  destination:
    server: https://kubernetes.default.svc
    namespace: zerobroker

  syncPolicy:
    automated:
      prune: true
      selfHeal: true

    syncOptions:
      - CreateNamespace=true
```

Apply it:

```bash
sudo k3s kubectl apply -f argocd-application.yaml
```

---

# 10. What the Application Configuration Means

### Repository

```yaml
repoURL: https://github.com/dcthefirm/zerobroker.git
```

Argo CD watches this Git repository.

### Branch

```yaml
targetRevision: CI-CD
```

For testing, Argo CD watches the `CI-CD` branch.

After testing, change this to:

```yaml
targetRevision: master
```

### Kubernetes manifests

```yaml
path: k8s
```

Argo CD reads all Kubernetes manifests under the `k8s` directory.

### Destination

```yaml
server: https://kubernetes.default.svc
```

This means Argo CD deploys to the Kubernetes cluster where Argo CD itself is running.

### Automatic synchronization

```yaml
syncPolicy:
  automated:
```

Argo CD automatically deploys changes detected in Git.

### Prune

```yaml
prune: true
```

If a Kubernetes resource is removed from Git, Argo CD can remove it from the cluster.

### Self-healing

```yaml
selfHeal: true
```

If the live Kubernetes state is manually changed and differs from Git, Argo CD can restore the Git-defined state.

---

# 11. Complete Deployment Flow

Suppose you modify the backend.

```bash
git add .
git commit -m "update backend"
git push origin CI-CD
```

GitHub Actions starts:

```text
GitHub
   ↓
GitHub Actions
   ↓
Build backend
   ↓
Push backend image
```

For example:

```text
dcthefirm/backend:abc123
```

GitHub Actions then updates:

```yaml
image: dcthefirm/backend:abc123
```

and commits it to GitHub.

Now Git contains:

```text
Desired State
     │
     ▼
backend:abc123
```

Argo CD detects the change:

```text
Git State:
backend:abc123

Cluster State:
backend:old-sha

        ↓

     OUT OF SYNC
```

With automated synchronization enabled:

```text
Argo CD
   ↓
Kubernetes API
   ↓
Deployment updated
   ↓
New ReplicaSet
   ↓
New Pods
```

K3s then pulls:

```text
dcthefirm/backend:abc123
```

from Docker Hub.

---

# 12. Rolling Deployment

Kubernetes performs a rolling update according to the Deployment configuration.

Conceptually:

```text
Old:
backend:old
backend:old
backend:old

        ↓

backend:old
backend:old
backend:new

        ↓

backend:old
backend:new
backend:new

        ↓

backend:new
backend:new
backend:new
```

The old Pods are gradually replaced by new Pods.

---

# 13. Git as the Source of Truth

The most important GitOps principle is:

```text
Git = Desired State
```

For example:

```yaml
replicas: 3

image: dcthefirm/backend:abc123
```

Git says the cluster should have:

```text
3 replicas
backend:abc123
```

Argo CD continuously works toward that state.

---

# 14. Drift Detection

Suppose someone manually changes the deployment:

```bash
sudo k3s kubectl scale deployment backend \
  --replicas=1 \
  -n zerobroker
```

but Git says:

```yaml
replicas: 3
```

Argo CD detects the difference:

```text
Git:
replicas = 3

K3s:
replicas = 1

Status:
OUT OF SYNC
```

With:

```yaml
selfHeal: true
```

Argo CD can restore the desired state.

---

# 15. Rollback

Because every image uses a Git SHA:

```text
Commit A → image A
Commit B → image B
Commit C → image C
```

Git provides a complete deployment history.

If version C is bad, revert the manifest change:

```text
image C
   ↓
image B
```

Argo CD detects the Git change and synchronizes Kubernetes back to version B.

---

# 16. Final Production Flow

After testing, the branch can be changed from:

```yaml
targetRevision: CI-CD
```

to:

```yaml
targetRevision: master
```

The final flow becomes:

```text
Developer
    │
    │ git push master
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Test
    ├── Build
    ├── Security scan
    ├── Push Docker images
    └── Update K8s manifests
             │
             ▼
        GitHub master
             │
             ▼
          Argo CD
             │
             ├── Detect changes
             ├── Compare state
             ├── Sync
             └── Self-heal
                    │
                    ▼
                   K3s
                    │
                    ▼
               ZeroBroker
```

---

## Key Principle

**GitHub Actions builds the application.**

**GitHub stores the desired Kubernetes state.**

**Argo CD deploys and continuously reconciles that state.**

**K3s runs the application.**
