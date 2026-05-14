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

*This guide will be updated as you progress through each phase.*
