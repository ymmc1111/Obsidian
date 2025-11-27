# Deployment Guide: Production Deployment

## Overview

Complete guide for deploying Operation Obsidian to production.

---

## Prerequisites

### Required Software
- Docker 20.10+
- Kubernetes 1.24+ (for K8s deployment)
- kubectl configured
- Git

### Required Resources
- **CPU**: 8 cores minimum
- **RAM**: 16GB minimum
- **Storage**: 100GB minimum
- **Network**: Stable internet connection

---

## Deployment Options

### Option 1: Docker Compose (Recommended for Single Server)

Best for:
- Development
- Small deployments
- Single server setups

### Option 2: Kubernetes (Recommended for Production)

Best for:
- Production environments
- High availability
- Scalability
- Multi-server deployments

---

## Option 1: Docker Compose Deployment

### 1. Clone Repository
```bash
git clone https://github.com/ymmc1111/Obsidian.git
cd Obsidian
```

### 2. Configure Environment

Create `.env` file:
```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=pocket_ops

# JWT
JWT_SECRET=<random-secret-key>

# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<strong-password>

# ClickHouse
CLICKHOUSE_PASSWORD=<strong-password>
```

**Generate Secrets**:
```bash
# JWT Secret
openssl rand -base64 32

# Passwords
openssl rand -base64 24
```

### 3. Build Images
```bash
./build-images.sh
```

### 4. Deploy Stack
```bash
docker compose up -d
```

### 5. Run Migrations
```bash
cat packages/database/migrations/*.sql | \
  docker exec -i pocket_ops_db psql -U admin -d pocket_ops
```

### 6. Verify Deployment
```bash
# Check all containers running
docker compose ps

# Check logs
docker compose logs -f

# Test health endpoints
curl http://localhost:3001/health
curl http://localhost:8000/health
```

### 7. Access Applications
- **Web Client**: http://localhost:3000
- **API Core**: http://localhost:3001
- **AI Service**: http://localhost:8000
- **Science Lab**: http://localhost:8501
- **MLflow**: http://localhost:5000
- **MinIO**: http://localhost:9001

---

## Option 2: Kubernetes Deployment

### 1. Prepare Cluster

**Create Namespace**:
```bash
kubectl create namespace pocket-ops
```

**Set Context**:
```bash
kubectl config set-context --current --namespace=pocket-ops
```

### 2. Create Secrets

```bash
# Database credentials
kubectl create secret generic postgres-secret \
  --from-literal=username=admin \
  --from-literal=password=<strong-password>

# JWT secret
kubectl create secret generic jwt-secret \
  --from-literal=secret=<random-secret-key>

# MinIO credentials
kubectl create secret generic minio-secret \
  --from-literal=root-user=admin \
  --from-literal=root-password=<strong-password>
```

### 3. Build and Push Images

**Tag for Registry**:
```bash
docker tag pocket-ops/api-core:latest gcr.io/<project>/api-core:latest
docker tag pocket-ops/web-client:latest gcr.io/<project>/web-client:latest
docker tag pocket-ops/data-pipeline:latest gcr.io/<project>/data-pipeline:latest
docker tag pocket-ops/science-lab:latest gcr.io/<project>/science-lab:latest
```

**Push to Registry**:
```bash
docker push gcr.io/<project>/api-core:latest
docker push gcr.io/<project>/web-client:latest
docker push gcr.io/<project>/data-pipeline:latest
docker push gcr.io/<project>/science-lab:latest
```

### 4. Update Manifests

Edit `k8s/base/*.yaml` files to use your registry:
```yaml
image: gcr.io/<project>/api-core:latest
```

### 5. Deploy to Kubernetes
```bash
kubectl apply -k k8s/base
```

### 6. Verify Deployment
```bash
# Check pods
kubectl get pods -n pocket-ops

# Check services
kubectl get svc -n pocket-ops

# Check logs
kubectl logs -f deployment/api-core -n pocket-ops
```

### 7. Access Applications

**Get LoadBalancer IPs**:
```bash
kubectl get svc -n pocket-ops
```

Access via external IPs:
- **Web Client**: http://<web-client-ip>:3000
- **API Core**: http://<api-core-ip>:3001

---

## SSL/TLS Configuration

### Using Cert-Manager (Kubernetes)

**Install Cert-Manager**:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

**Create Issuer**:
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

**Create Ingress**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pocket-ops-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - pocket-ops.example.com
    secretName: pocket-ops-tls
  rules:
  - host: pocket-ops.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-client
            port:
              number: 3000
```

---

## Backup and Recovery

### Database Backup

**PostgreSQL**:
```bash
docker exec pocket_ops_db pg_dump -U admin pocket_ops > backup.sql
```

**TimescaleDB**:
```bash
docker exec pocket_ops_telemetry pg_dump -U admin pocket_ops_telemetry > telemetry_backup.sql
```

**ClickHouse**:
```bash
docker exec pocket_ops_clickhouse clickhouse-client --query="BACKUP DATABASE default TO Disk('backups', 'backup.zip')"
```

### Restore

**PostgreSQL**:
```bash
cat backup.sql | docker exec -i pocket_ops_db psql -U admin -d pocket_ops
```

---

## Monitoring Setup

### Prometheus

**Deploy Prometheus**:
```bash
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml
```

**Apply Configuration**:
```bash
kubectl apply -f prometheus.yml
```

### Grafana

**Deploy Grafana**:
```bash
kubectl apply -f https://raw.githubusercontent.com/grafana/grafana/main/deploy/kubernetes/grafana.yaml
```

**Import Dashboards**:
1. Access Grafana UI
2. Add Prometheus data source
3. Import dashboard JSON from `monitoring/dashboards/`

---

## Scaling

### Horizontal Pod Autoscaling (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-core-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-core
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Security Hardening

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-core-policy
spec:
  podSelector:
    matchLabels:
      app: api-core
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: web-client
    ports:
    - protocol: TCP
      port: 3001
```

### Pod Security Policies

```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  runAsUser:
    rule: MustRunAsNonRoot
  seLinux:
    rule: RunAsAny
  fsGroup:
    rule: RunAsAny
```

---

## Troubleshooting

### Pods Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Database Connection Issues
```bash
# Test connection
kubectl exec -it <api-pod> -- nc -zv postgres 5432

# Check secrets
kubectl get secret postgres-secret -o yaml
```

### Image Pull Errors
```bash
# Check image pull secret
kubectl get secret regcred

# Create if missing
kubectl create secret docker-registry regcred \
  --docker-server=gcr.io \
  --docker-username=_json_key \
  --docker-password="$(cat key.json)"
```

---

## Maintenance

### Rolling Updates
```bash
# Update image
kubectl set image deployment/api-core api-core=gcr.io/<project>/api-core:v2

# Check rollout status
kubectl rollout status deployment/api-core

# Rollback if needed
kubectl rollout undo deployment/api-core
```

### Database Migrations
```bash
# Run migrations
kubectl exec -it <api-pod> -- npm run migrate

# Verify
kubectl exec -it postgres-pod -- psql -U admin -d pocket_ops -c "\dt"
```

---

## Next Steps

- [Monitoring Guide](monitoring.md)
- [Backup Strategy](backup.md)
- [Disaster Recovery](disaster-recovery.md)
