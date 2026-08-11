# ZeroBroker --- Traefik Ingress Setup

This document describes the Traefik Ingress Controller setup, internal
service connectivity tests, project architecture, and Ingress path
routing for the **ZeroBroker** Kubernetes application running on
**Kind**.

------------------------------------------------------------------------

## 1. Install Traefik Ingress Controller

Traefik must be installed as the Ingress Controller before the
application can be accessed through the configured Ingress routes.

### Add the Traefik Helm Repository

``` bash
helm repo add traefik https://helm.traefik.io/traefik
helm repo update
```

### Install Traefik in the `zero-broker` Namespace

``` bash
helm install traefik traefik/traefik \
  --namespace zero-broker \
  --set ports.web.nodePort=30080 \
  --set service.type=NodePort
```

### Verify the Installation

Check the Traefik pods:

``` bash
kubectl get pods -n zero-broker
```

Check the Traefik service:

``` bash
kubectl get svc -n zero-broker
```

Traefik exposes the HTTP entry point through **NodePort `30080`**.

------------------------------------------------------------------------

## 2. Test Services Directly from Inside the Cluster

Before testing the application through Traefik, verify that all
Kubernetes Services are reachable from inside the cluster.

### Create a Temporary Test Pod

If a test pod does not already exist, create one using the
`curlimages/curl` image:

``` bash
kubectl run test \
  --image=curlimages/curl \
  -it \
  --rm \
  -n zero-broker \
  -- sh
```

The `--rm` option automatically removes the pod when you exit the shell.

### Connect to an Existing Test Pod

If a pod named `test` already exists:

``` bash
kubectl exec -it test -n zero-broker -- sh
```

### Test Individual Services

Run the following commands **inside the test pod**:

``` bash
curl http://backend-auth:5000/health
curl http://backend-home:4001/health
curl http://backend-rent:4002/health
curl http://backend-buy:4003/health
curl http://backend-search:4004/health
curl http://zerobroker-frontend-service:80
```

### Test All Services at Once

``` bash
curl http://backend-auth:5000/health && \
curl http://backend-home:4001/health && \
curl http://backend-rent:4002/health && \
curl http://backend-buy:4003/health && \
curl http://backend-search:4004/health && \
curl http://zerobroker-frontend-service:80
```

If all commands succeed, the Kubernetes Services are communicating
correctly inside the cluster.

------------------------------------------------------------------------

## 3. Project Architecture

The application is accessed by the user's browser through the Traefik
Ingress Controller.

``` text
User Browser
     |
     v
zerobroker.local:30080
     |
     v
/etc/hosts
     |
     | resolves to 172.18.0.2
     v
Kind Cluster Node
     |
     v
Traefik Ingress Controller
     |
     | Port: 30080
     |
     v
Reads Ingress Rules
     |
     +------------------------------+
     |                              |
     |  /                           | --> zerobroker-frontend-service:80
     |  /api/auth                   | --> backend-auth:5000
     |  /api/home                   | --> backend-home:4001
     |  /api/rent                   | --> backend-rent:4002
     |  /api/buy                    | --> backend-buy:4003
     |  /api/search                 | --> backend-search:4004
     |                              |
     +------------------------------+
                    |
                    v
          Individual Services
                    |
                    v
              MongoDB Atlas
                (External)
```

### Request Flow

The overall request flow is:

``` text
Browser
  |
  | HTTP request
  v
zerobroker.local:30080
  |
  v
Kind Node
  |
  v
Traefik
  |
  |-- /              --> Frontend
  |-- /api/auth      --> Auth Backend
  |-- /api/home      --> Home Backend
  |-- /api/rent      --> Rent Backend
  |-- /api/buy       --> Buy Backend
  |-- /api/search    --> Search Backend
  |
  v
Backend Services
  |
  v
MongoDB Atlas
```

------------------------------------------------------------------------

## 4. Ingress Path Communication

The Ingress resource uses the host:

``` text
zerobroker.local
```

Traefik matches incoming requests based on the URL path and forwards
them to the corresponding Kubernetes Service.

  Path            Path Type   Kubernetes Service                  Port
  --------------- ----------- ------------------------------- --------
  `/`             Prefix      `zerobroker-frontend-service`       `80`
  `/api/auth`     Prefix      `backend-auth`                    `5000`
  `/api/home`     Prefix      `backend-home`                    `4001`
  `/api/rent`     Prefix      `backend-rent`                    `4002`
  `/api/buy`      Prefix      `backend-buy`                     `4003`
  `/api/search`   Prefix      `backend-search`                  `4004`

### Routing Diagram

``` text
Host: zerobroker.local
        |
        v
      Traefik
        |
        +------------------------------------------+
        |                                          |
        |  Path: /                                 |
        |  Prefix                                  |
        |       |                                  |
        |       +--> zerobroker-frontend-service:80
        |                                          |
        |  Path: /api/auth                         |
        |  Prefix                                  |
        |       |                                  |
        |       +--> backend-auth:5000             |
        |                                          |
        |  Path: /api/home                         |
        |  Prefix                                  |
        |       |                                  |
        |       +--> backend-home:4001             |
        |                                          |
        |  Path: /api/rent                         |
        |  Prefix                                  |
        |       |                                  |
        |       +--> backend-rent:4002             |
        |                                          |
        |  Path: /api/buy                          |
        |  Prefix                                  |
        |       |                                  |
        |       +--> backend-buy:4003              |
        |                                          |
        |  Path: /api/search                       |
        |  Prefix                                  |
        |       |                                  |
        |       +--> backend-search:4004           |
        |                                          |
        +------------------------------------------+
```

------------------------------------------------------------------------

## 5. Expected Application Access

Once Traefik and the Ingress resource are configured correctly, the
application should be accessible through:

``` text
http://zerobroker.local:30080
```

The `/etc/hosts` file should contain an entry mapping `zerobroker.local`
to the Kind node IP:

``` text
172.18.0.2 zerobroker.local
```

You can verify the mapping with:

``` bash
getent hosts zerobroker.local
```

------------------------------------------------------------------------

## 6. Useful Verification Commands

### Check All Resources

``` bash
kubectl get all -n zero-broker
```

### Check Ingress

``` bash
kubectl get ingress -n zero-broker
```

### Describe Ingress

``` bash
kubectl describe ingress -n zero-broker
```

### Check Traefik Logs

``` bash
kubectl logs -n zero-broker \
  -l app.kubernetes.io/name=traefik
```

### Check Services

``` bash
kubectl get svc -n zero-broker
```

### Check Pods

``` bash
kubectl get pods -n zero-broker -o wide
```

------------------------------------------------------------------------

## Architecture Summary

``` text
                         ┌──────────────────────┐
                         │     User Browser      │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP
                                    v
                         ┌──────────────────────┐
                         │ zerobroker.local     │
                         │ Port: 30080          │
                         └──────────┬───────────┘
                                    │
                                    v
                         ┌──────────────────────┐
                         │   Kind Cluster Node  │
                         └──────────┬───────────┘
                                    │
                                    v
                         ┌──────────────────────┐
                         │       Traefik        │
                         │  Ingress Controller  │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              v                     v                     v
        ┌──────────┐          ┌──────────┐          ┌──────────┐
        │ Frontend │          │ Backend  │          │ Backend  │
        │   :80    │          │ Services │          │ Services │
        └──────────┘          └────┬─────┘          └──────────┘
                                   │
                                   v
                            ┌──────────────┐
                            │ MongoDB Atlas│
                            │  (External)  │
                            └──────────────┘
```