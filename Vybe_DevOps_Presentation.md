# Vybe Social Media Platform: DevOps & Cloud Migration
## Presentation Outline & Speaker Notes

---

### Slide 1: Title Slide
* **Title:** Vybe Social Media Platform
* **Subtitle:** Modernizing from Local Host to Cloud-Native DevOps
* **Presenter:** [Your Name]
* **Speaker Notes:** "Welcome everyone. Today I will be presenting the architecture and deployment journey of my project, Vybe—a modern, real-time social media platform. I will discuss how I transitioned this application from a local development environment into a production-grade, highly available cloud architecture using modern DevOps practices."

---

### Slide 2: Project Overview & Tech Stack
* **Title:** Application Architecture
* **Bullet Points:**
  * **Frontend:** React.js, Redux Toolkit, TailwindCSS
  * **Backend:** Node.js, Express.js
  * **Database:** MongoDB Atlas (Cloud Database)
  * **Media Storage:** ImageKit (CDN for real-time image optimization)
  * **Real-Time Engine:** Server-Sent Events (SSE) for live chat
* **📸 Screenshot Proof to Add:** 
  * A screenshot of your `docker-compose.yml` file showing the MongoDB Atlas URI connection string injected as an environment variable.
* **Speaker Notes:** "Vybe is a full-stack application built on the MERN stack. A key engineering challenge was implementing real-time chat. Instead of heavy WebSockets, I utilized Server-Sent Events (SSE) which is lighter, highly efficient for one-way server-to-client message pushing, and natively supported by browsers."

---

### Slide 3: The Problem with "It Works on My Machine"
* **Title:** Containerization with Docker
* **Bullet Points:**
  * **Challenge:** Environment variable mismatches and deployment inconsistencies.
  * **Solution:** Docker & Docker Compose
  * **Execution:** `docker-compose up --build -d`
* **📸 Screenshot Proof to Add:** 
  * A screenshot of your terminal successfully running `docker-compose up --build -d`.
  * A screenshot of Docker Desktop showing the Vybe containers running.
* **Speaker Notes:** "To eliminate the classic 'it works on my machine' problem, I wrote Dockerfiles for both the frontend and backend. The command `docker-compose up --build -d` reads my configuration, builds the isolated container images, and runs them silently in the background (`-d`). This ensures my app runs exactly the same way on any computer."

---

### Slide 4: Scaling with Kubernetes (K8s)
* **Title:** Container Orchestration
* **Bullet Points:**
  * **Challenge:** Ensuring zero downtime and intelligent traffic routing.
  * **Solution:** Kubernetes Deployments, Services, and Ingress.
  * **Execution:** `kubectl apply -f ./k8s` followed by `kubectl get pods`
* **📸 Screenshot Proof to Add:** 
  * A screenshot of your terminal running `kubectl apply -f ./k8s` showing the resources being created.
  * A screenshot of `kubectl get pods` showing 2 frontend pods and 2 backend pods in the `Running` state.
* **Speaker Notes:** "Docker alone isn't enough for production—if a container crashes, the app goes down. I introduced Kubernetes as the orchestrator. By running the command `kubectl apply -f ./k8s`, I tell Kubernetes to read my declarative YAML files and create the cluster. I used `kubectl get pods` to verify that my Deployments successfully spun up 2 replicas of each service, ensuring self-healing high availability."

---

### Slide 5: Transitioning to the Cloud (Infrastructure as Code)
* **Title:** AWS Infrastructure via Terraform
* **Bullet Points:**
  * **Challenge:** Manual AWS configuration is slow and unrepeatable.
  * **Solution:** Terraform (IaC)
  * **Execution:** `terraform init` and `terraform apply`
* **📸 Screenshot Proof to Add:** 
  * A screenshot of the terminal showing `Plan: 44 to add, 0 to change, 0 to destroy.`.
  * The screenshots you took earlier of your AWS Console showing the `vybe-vpc`, `vybe-cluster` (EKS), and the ECR registries.
* **Speaker Notes:** "With Kubernetes proven locally, it was time for the Cloud. Rather than manually clicking through the AWS website, I used Terraform to define my entire infrastructure as code. The command `terraform plan` calculates exactly what AWS resources are needed. Then, `terraform apply` automatically provisions a secure Virtual Private Cloud, Elastic Container Registries, and an Elastic Kubernetes Service (EKS) cluster in about 15 minutes."

---

### Slide 6: Continuous Integration & Deployment (Phase 4)
* **Title:** Jenkins CI/CD Pipeline
* **Bullet Points:**
  * **The CI/CD Engine:** Jenkins (Hosted on a Terraform-provisioned EC2 instance).
  * **Execution:** `ssh -i vybe-jenkins-key.pem ec2-user@<IP>`
* **📸 Screenshot Proof to Add:** 
  * A screenshot of your terminal showing the successful SSH connection into the AWS Linux server.
  * *(Later)* A screenshot of the Jenkins UI showing a successful Green Build pipeline.
* **Speaker Notes:** "The final piece of the DevOps puzzle is automation. I provisioned a dedicated EC2 server using Terraform to run Jenkins. I used the `ssh -i` command with a securely generated `.pem` key to log directly into the AWS Linux server from my terminal to configure the pipeline. This pipeline ensures that whenever new code is pushed to GitHub, Jenkins automatically builds the Docker images and deploys them to the EKS cluster."

---

### Slide 7: Conclusion & Key Learnings
* **Title:** Outcomes & Future Scope
* **Bullet Points:**
  * Achieved a true microservice-ready architecture.
  * Mastered the transition from local code to cloud-native deployments.
  * **Future scope:** Implementing Prometheus/Grafana for cluster monitoring.
* **Speaker Notes:** "In conclusion, this project evolved from a standard web application into a robust, cloud-native system. The integration of Docker, Kubernetes, Terraform, and Jenkins mirrors enterprise-level architectures. Thank you for your time, I am open to any questions."
