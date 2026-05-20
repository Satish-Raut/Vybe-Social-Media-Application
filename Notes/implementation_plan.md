# Vybe DevOps Implementation Plan (Full AWS Architecture)

This document outlines the definitive, step-by-step workflow for the Vybe DevOps assignment. We are adhering to the original assignment Synopsis (Full AWS) while making the smart architectural decision to retain ImageKit for media optimization.

## User Review Required

> [!IMPORTANT]
> Please review this final workflow. This represents the EXACT path we will take together to finish your assignment. Once you approve, we will begin executing Step 1!

## The Workflow (Step-by-Step)

### Phase 1: Local Containerization Verification (Current Step)
*   **Action:** Run `docker compose up --build` on your local machine.
*   **Goal:** Verify that the Dockerfiles we created successfully build the Frontend (React/Nginx) and Backend (Node.js), and that the app functions correctly in a containerized environment before we introduce cloud complexity.

### Phase 2: Local Kubernetes Testing (Minikube)
*   **Action:** Write the core Kubernetes YAML manifests (`deployment.yaml`, `service.yaml`, `secret.yaml`, `ingress.yaml`).
*   **Goal:** Deploy the application locally using Minikube. This ensures our Kubernetes logic is flawless before we deploy to AWS EKS.

### Phase 3: Infrastructure as Code (Terraform)
*   **Action:** Write Terraform (`.tf`) scripts to declaratively provision your AWS architecture.
*   **Goal:** Define the following resources as code:
    *   Custom VPC with public and private subnets.
    *   EKS Cluster with `t3.medium` worker nodes.
    *   EC2 Instance for the Jenkins server.
    *   ECR (Elastic Container Registry) repositories for Frontend and Backend images.

### Phase 4: CI/CD Pipeline Setup (Jenkins)
*   **Action:** SSH into the AWS EC2 instance, install Jenkins, and write a declarative `Jenkinsfile`.
*   **Goal:** Automate the entire deployment lifecycle: `GitHub Push -> Jenkins pulls code -> Builds Docker Images -> Pushes to AWS ECR -> Applies YAML to AWS EKS`.

### Phase 5: Cloud Deployment & DNS (Name.com)
*   **Action:** Run `terraform apply` to build the cloud, let Jenkins run the pipeline, and configure DNS.
*   **Goal:** 
    1. Your app goes live on AWS EKS.
    2. Kubernetes provisions an AWS Elastic Load Balancer (ELB).
    3. You log into Name.com and point your free `vybe.live` domain to the AWS ELB.

### Phase 6: Monitoring (Prometheus & Grafana)
*   **Action:** Deploy Prometheus and Grafana onto the EKS cluster using Helm.
*   **Goal:** Create a live Grafana dashboard visualizing the metrics exposed by your Node.js backend (e.g., active users, API latency).

### Phase 7: Demo & Teardown (Crucial Step)
*   **Action:** Present the live `vybe.live` application and Jenkins pipeline to your teacher.
*   **Goal:** Immediately after the presentation, run `terraform destroy` from your laptop. This will systematically delete the EKS cluster, EC2 instances, and Load Balancers, ensuring you do not incur further AWS charges.
