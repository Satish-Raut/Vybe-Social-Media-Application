# Vybe — DevOps Learning Guide

> This file is a living document. New guidance will be added as you progress through each DevOps phase of this project.

---

## 📌 Core Philosophy

> **DevOps is not a separate thing you "add on" — it is the process of shipping the app you built.**

The best way to learn Docker is to containerize *your own app* that you already understand deeply.
The best way to understand Kubernetes is to deploy *something you actually care about*.
That is exactly why finishing the application first makes the DevOps learning 10x more effective and meaningful.

---

## 🗺️ Recommended Phase Order (For Beginners)

### ✅ Phase 1 — Complete the Application (Current Phase)
**Goal:** Build a fully working MERN application before touching any DevOps tooling.

**Why first?**
- DevOps tools wrap around a *working* application. If you containerize a broken app, you just have a broken container.
- Debugging is 10x harder when you cannot tell if an error is in your app code or your Docker/K8s configuration.
- You learn DevOps *meaningfully* when you can see a real app being deployed — not a "Hello World".

**Remaining App Features to Build:**
- [ ] Posts API (create, edit, delete, image upload)
- [ ] Feed API (personalized home feed based on following graph)
- [ ] Likes & Comments system
- [ ] Socket.io (real-time notifications)
- [ ] Explore / Search page

---

### 🐳 Phase 2 — Containerization with Docker
**Goal:** Package the frontend and backend as independent, portable Docker images.
**This is where DevOps "clicks" for most beginners — start here!**

**Key Activities:**
- Write a `Dockerfile` for the backend (Node.js + Express)
- Write a `Dockerfile` for the frontend (React built with Vite, served via Nginx)
- Write a `docker-compose.yml` to run both containers locally together
- Test the fully containerized app locally before pushing anywhere

**Key Concepts to Learn:**
- `FROM`, `COPY`, `RUN`, `EXPOSE`, `CMD` — Dockerfile instructions
- Multi-stage builds (build React in Node, then serve with Nginx — smaller final image)
- Container networking (how frontend talks to backend inside Docker)
- Volume mounting for local development

**Tools:** Docker Desktop, Docker CLI

---

### ⚙️ Phase 3 — CI/CD Pipeline with Jenkins on AWS EC2
**Goal:** Automate the full build → test → deploy lifecycle on every `git push`.

**Key Activities:**
- Launch a Jenkins server on an AWS EC2 (t2.medium) instance
- Write a `Jenkinsfile` with the following pipeline stages:
  1. `Checkout` — Pull latest code from GitHub
  2. `Test` — Run Jest/Mocha tests
  3. `Docker Build` — Build frontend and backend images
  4. `Push to ECR` — Tag and push images to AWS Elastic Container Registry
  5. `Deploy` — Rolling deploy to EKS via `kubectl`
- Connect Jenkins to your GitHub repository via Webhooks

**Key Concepts to Learn:**
- Jenkins pipeline syntax (Declarative vs Scripted)
- Environment variables and credentials management in Jenkins
- What a Webhook is and how GitHub triggers Jenkins automatically
- AWS ECR (like DockerHub, but private and hosted on AWS)

---

### 🌍 Phase 4 — Infrastructure as Code with Terraform
**Goal:** Provision all AWS infrastructure declaratively using code, not clicking in the AWS Console.

**Key AWS Resources to Provision:**
| Terraform Resource | AWS Service | Purpose |
|---|---|---|
| `module.vpc` | AWS VPC | Isolated network with public + private subnets |
| `module.eks` | AWS EKS | Kubernetes cluster (t3.medium nodes) |
| `aws_instance` | AWS EC2 | Jenkins server |
| `aws_ecr_repository` | AWS ECR | Private Docker image registry |
| `aws_s3_bucket` | AWS S3 | Media uploads (profile pics, post images) |
| `aws_iam_role` | AWS IAM | Service accounts for EKS pods |

**Key Concepts to Learn:**
- `terraform init`, `plan`, `apply`, `destroy`
- State files (`terraform.tfstate`) — never commit these to Git!
- Variables and outputs in Terraform
- Why IaC matters: reproducibility, version control, disaster recovery

---

### ☸️ Phase 5 — Kubernetes Orchestration on AWS EKS
**Goal:** Deploy, scale, and self-heal your containerized app on a managed Kubernetes cluster.

**Key Activities:**
- Write Kubernetes YAML manifests:
  - `Deployment` — Define how many replicas of each container to run
  - `Service` — Expose the deployment internally or externally
  - `ConfigMap` — Store non-sensitive configuration (e.g., API URLs)
  - `Secret` — Store sensitive data (e.g., MongoDB URI, Clerk keys)
  - `Ingress` — Route external HTTP traffic to the right service
- Configure HPA (Horizontal Pod Autoscaler) based on CPU usage (min: 1, max: 3 replicas)
- Set up rolling deployments for zero-downtime updates

**Key Concepts to Learn:**
- Pods, Deployments, Services, Namespaces
- The difference between `ClusterIP`, `NodePort`, and `LoadBalancer` services
- Why Kubernetes "self-heals" (it restarts crashed pods automatically)
- `kubectl` CLI commands: `get`, `apply`, `logs`, `describe`, `exec`

---

### 📊 Phase 6 — Monitoring with Prometheus + Grafana
**Goal:** Get real-time visibility into your application's health and usage.

**Key Activities:**
- Install the `prom-client` npm package in your Express backend
- Expose a `/metrics` endpoint that Prometheus can scrape
- Deploy Prometheus and Grafana on Kubernetes using Helm charts
- Build Grafana dashboards for the following custom metrics:

| Metric Name | Description |
|---|---|
| `posts_created_total` | Cumulative counter of all posts published |
| `active_users_gauge` | Real-time count of users with active Socket.io connections |
| `api_request_duration_ms` | Histogram of HTTP endpoint response times by route |
| `s3_upload_total` | Count of successful media uploads per minute |
| `failed_logins_total` | Count of failed authentication attempts (security monitoring) |
| `feed_load_latency_ms` | Time taken to assemble a personalized user feed |

**Key Concepts to Learn:**
- Pull-based vs push-based monitoring (Prometheus is pull-based)
- PromQL — Prometheus query language for building dashboards
- Alerting — Set up alerts in Grafana to notify you when something breaks

---

## 🛡️ DevSecOps Principles (Apply Throughout All Phases)

- **Never commit secrets to Git.** Use `.env` files locally, and Kubernetes Secrets / AWS Secrets Manager in production.
- **Use IAM roles, not access keys.** Attach IAM roles directly to EC2 and EKS pods instead of hardcoding AWS keys.
- **Apply least privilege.** Each service should only have the permissions it absolutely needs.
- **S3 Bucket Policies.** Ensure your media bucket is private by default; only allow access via signed URLs or specific IAM roles.
- **Keep your `terraform.tfstate` out of Git.** Store it in an S3 backend with DynamoDB state locking.

---

## 💡 One Thing to Do Right Now (Even in Phase 1)

**Git discipline** — Every DevOps pipeline starts and ends with Git. Develop good habits now:
- Use feature branches (`git checkout -b feature/post-api`)
- Write meaningful commit messages (e.g., `feat: add post creation endpoint with ImageKit upload`)
- Never push directly to `main` — use Pull Requests

---

---

## 🌐 Phase 7 — Custom Domain + DNS Setup (GitHub Developer Pack)

**Goal:** Point your free developer domain to your live Vybe application running on AWS EKS, so users can access it at `vybe.live` (or similar) instead of a raw AWS IP address.

### Step 1: Claim Your Free Domain

You have two options from your **GitHub Developer Pack**:

| Provider | Offer | Best For |
|---|---|---|
| **Name.com** | Free domain with `.live`, `.studio`, `.app`, `.dev`, `.software` extensions | `vybe.live` or `vybe.app` ✅ Recommended |
| **Namecheap** | Free `.me` domain for 1 year | `vybe.me` |

> **Recommendation:** Go with **Name.com** and register `vybe.live` or `vybe.app` — these sound premium and are perfect for a social media platform portfolio project.

**How to claim:**
1. Go to [education.github.com/pack](https://education.github.com/pack)
2. Find **Name.com** → Click "Get access by connecting your GitHub account"
3. Sign in with GitHub → Search for your desired domain → Register for free

---

### Step 2: How AWS Gives You a Public Address

When you deploy on **AWS EKS** and create a Kubernetes `Service` of type `LoadBalancer` (or an `Ingress` with an ALB Ingress Controller), AWS automatically provisions an **Elastic Load Balancer (ELB)**.

This ELB gives you either:
- A **DNS hostname** (e.g., `a1b2c3d4.us-east-1.elb.amazonaws.com`) — most common
- A **static IP address** — only if you use a Network Load Balancer (NLB)

```
Internet
    │
    ▼
[ Your Domain: vybe.live ]  ← DNS record points here
    │  (CNAME or A Record in Name.com)
    ▼
[ AWS Load Balancer: a1b2.elb.amazonaws.com ]
    │
    ▼
[ Kubernetes Ingress Controller ]
    │           │
    ▼           ▼
[ Frontend ] [ Backend ]
  Service      Service
```

---

### Step 3: Configure DNS on Name.com

Once your EKS cluster is running and you have your Load Balancer address, log into **Name.com** and add these DNS records:

**If AWS gives you a DNS hostname (most common — use CNAME):**

| Type | Host | Value | TTL |
|---|---|---|---|
| `CNAME` | `@` (root) | `a1b2c3d4.us-east-1.elb.amazonaws.com` | 300 |
| `CNAME` | `www` | `a1b2c3d4.us-east-1.elb.amazonaws.com` | 300 |

**If AWS gives you a static IP (use A Record):**

| Type | Host | Value | TTL |
|---|---|---|---|
| `A` | `@` (root) | `54.123.45.67` | 300 |
| `A` | `www` | `54.123.45.67` | 300 |

> **Note:** DNS changes can take up to **24-48 hours** to propagate globally, but usually it's just a few minutes.

---

### Step 4: Kubernetes Ingress for Domain Routing

Instead of exposing each service directly, use a **Kubernetes Ingress** resource. It acts as a smart reverse proxy that routes traffic based on the domain name and URL path.

**Install the AWS Load Balancer Controller** (handles Ingress on EKS):
```bash
# Add the EKS Helm chart repo
helm repo add eks https://aws.github.io/eks-charts

# Install the AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=vybe-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

**Your Ingress manifest (`k8s/ingress.yaml`):**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: vybe-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    # Redirect HTTP → HTTPS automatically
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
spec:
  rules:
  # Route traffic based on domain name
  - host: vybe.live
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: vybe-backend-service
            port:
              number: 4000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: vybe-frontend-service
            port:
              number: 80
```

---

### Step 5: Free SSL/HTTPS with cert-manager

Never run a production app on plain HTTP. Use **cert-manager** with **Let's Encrypt** to get a free SSL certificate automatically.

```bash
# Install cert-manager on your cluster
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml

# Create a ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com   # ← Replace with your email
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: alb
EOF
```

Once set up, your Vybe app will be live at `https://vybe.live` with a valid SSL certificate — **completely free!**

---

### 🗂️ Summary: Full DNS Flow for Vybe

```
User types: https://vybe.live
         │
         ▼
    Name.com DNS
    (CNAME → AWS ELB)
         │
         ▼
  AWS Elastic Load Balancer
  (provisioned by EKS Ingress)
         │
         ▼
  Kubernetes Ingress Controller
         │
    ┌────┴────┐
    ▼         ▼
  /api/*    /  (everything else)
  Backend   Frontend
  Service   Service (Nginx)
```

> **Key Takeaway:** The domain is just a human-readable pointer. The real traffic flow is: `DNS → AWS ELB → K8s Ingress → Services → Pods`. Your Kubernetes cluster is the final destination!

---

*This guide will be updated as you progress through each phase.*

