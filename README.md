# ZeroBroker 
https://zero-broker.duckdns.org

ZeroBroker is a **containerized real-estate microservices application** running on Kubernetes with automated CI/CD, GitOps deployment, monitoring, and alerting.

 ![Alternative Text](/Images/diagram.gif)


 ![Alternative Text](/Images/updatesd.gif)


## Architecture

```text
Developer
   ↓
GitHub
   ↓
GitHub Actions
   ↓
Docker Hub
   ↓
Argo CD
   ↓
Kubernetes
   ├── Frontend
   ├── Auth Service
   ├── Home Service
   ├── Buy Service
   ├── Rent Service
   └── Search Service
        ↓
   MongoDB Atlas

Kubernetes
   ↓
Prometheus → Alert Rules → Alertmanager → Discord
   ↓
Grafana Dashboards
```

## Tech Stack

* **Frontend:** React
* **Backend:** Node.js / TypeScript
* **Database:** MongoDB Atlas
* **Containers:** Docker
* **Orchestration:** Kubernetes
* **CI/CD:** GitHub Actions
* **Container Registry:** Docker Hub
* **GitOps / Deployment:** Argo CD
* **Monitoring:** Prometheus + Blackbox Exporter
* **Dashboards:** Grafana
* **Alerting:** PrometheusRule + Alertmanager + Discord

## Microservices

| Service        | Port |
| -------------- | ---: |
| Frontend       | 5173 |
| backend-auth   | 5000 |
| backend-home   | 4001 |
| backend-rent   | 4002 |
| backend-buy    | 4003 |
| backend-search | 4004 |

## CI/CD Flow

1. Code is pushed to **GitHub**.
2. **GitHub Actions** runs tests and builds Docker images.
3. Images are pushed to **Docker Hub**.
4. Kubernetes manifests are updated.
5. **Argo CD** detects the changes and synchronizes them to the Kubernetes cluster.
6. Kubernetes deploys the updated application.

 ![Alternative Text](/Images/linkedin_high_quality.gif)

## Monitoring & Alerts

**Prometheus** monitors Kubernetes and application metrics.

The project has four main alert rules:

* Deployment replicas unavailable
* Pod crash looping
* Endpoint returning HTTP `400+`
* Endpoint/probe down

Alerts are handled by **Alertmanager** and sent to **Discord** through webhooks.

**Grafana** is used to visualize:

* Application health
* CPU and memory usage
* Pod/deployment status
* Endpoint status and response time
* Prometheus alerts

 ![Alternative Text](/Images/ChatGPT%20Image%20Aug%2023,%202026,%2005_29_23%20PM.png)


 ![Alternative Text](/Images/Pasted%20image.png)

## Kubernetes Namespaces

* `zero-broker` — Application workloads
* `monitoring` — Prometheus, Grafana, Alertmanager and monitoring components
* `argocd` — Argo CD

![Alternative Text](/Images/k3s.png)


## Repository Structure

```text
.
├── backend-auth/
├── backend-buy/
├── backend-home/
├── backend-rent/
├── backend-search/
├── front-end/
├── k8s/
│   ├── backend/
│   ├── frontend/
│   ├── ingress/
│   ├── namespace/
│   └── secrets/
└── .github/
    └── workflows/
        └── ci_cd.yaml
```

## Deployment

The application can be deployed to Kubernetes using the manifests in the `k8s/` directory.

For the GitOps setup, **Argo CD is the preferred deployment method** because it continuously monitors the Git repository and keeps the Kubernetes cluster synchronized with the desired configuration.

---

### End-to-End

```text
GitHub
  ↓
GitHub Actions
  ↓
Docker Hub
  ↓
Argo CD
  ↓
Kubernetes
  ↓
ZeroBroker Application
  ↓
Prometheus
  ↓
Alert Rules
  ↓
Alertmanager
  ↓
Discord
```

**ZeroBroker provides a complete workflow from source code → CI/CD → containerization → GitOps deployment → Kubernetes → monitoring → alerting.**
