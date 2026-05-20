# Vybe DevOps Presentation Command Cheat-Sheet 🚀🛡️

This document is your **ultimate quick-reference guide** during your project presentation or viva. If your teacher asks you to explain the setup, show status, or run commands, copy and paste these exact commands!

---

## 🏗️ 1. Terraform Commands (Infrastructure as Code)

*Note: Always run these commands inside your local `terraform/` directory.*

### 🔍 Check/Verify the Infrastructure State

```powershell
terraform state list
```

* **What it does:** Lists all the AWS resources (VPC, EKS, EC2, ECR) currently managed by your Terraform scripts.

### 🗑️ Clean Teardown (CRUCIAL AFTER PRESENTATION)

```powershell
terraform destroy
```

* **What it does:** Destroys all provisioned AWS servers and networks cleanly to ensure you incur exactly $0.00 in charges.

---

## ☸️ 2. Kubernetes (kubectl) Core Commands

*Note: Run these from anywhere in your project directory.*

### 🌐 Get Your Live AWS Load Balancer URL

```powershell
kubectl get ingress vybe-ingress
```

* **What it does:** Prints the live AWS Elastic Load Balancer (ELB) address routing traffic to your app.

### 📦 View Running Pods & Containers

```powershell
kubectl get pods
```

* **What it does:** Shows if your `vybe-frontend` and `vybe-backend` pods are running successfully.

### 🔌 View Services & Internal Networking Ports

```powershell
kubectl get services
```

* **What it does:** Shows internal Kubernetes cluster IPs and port mappings.

### 🪵 Read Live Backend Application Logs

```powershell
kubectl logs -l app=vybe-backend --tail=100 -f
```

* **What it does:** Streams live Node.js logs. Extremely impressive to show your teacher when sending chat messages or uploading stories!

---

## 📈 3. Monitoring & Grafana (Helm) Commands

### 🖥️ Start the Grafana Tunnel (Start Monitoring)

```powershell
kubectl port-forward deployment/prometheus-stack-grafana 3100:3000 -n monitoring
```

* **What it does:** Maps the secure Grafana interface hosted on AWS EKS to your web browser at:
  👉 **`http://localhost:3100`**

### 🔑 Decrypt Grafana Admin Password

```powershell
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((kubectl get secret --namespace monitoring prometheus-stack-grafana -o jsonpath="{.data.admin-password}")))
```

* **What it does:** Decodes the base-64 encoded secret from EKS and prints your login password:
  🔑 **`B1Zoxl3Np19T2TIE0t762CByaqiBzaNFuzc8kmX9`**

### 📦 View Active Monitoring Pods (Prometheus)

```powershell
kubectl get pods -n monitoring
```

* **What it does:** Verifies that Prometheus, Grafana, Node Exporters, and State Metrics are fully operational.

---

## 🖥️ 4. Quick-Launch Dashboards (Open in Browser via Command Line)

*Run these commands directly in your PowerShell terminal to instantly launch your web browser to the respective page!*

### 🌐 Open the Live Vybe App

```powershell
Start-Process "http://www.bestvybe.live"
```

### 🛠️ Open the Jenkins Server Console

```powershell
Start-Process "http://44.200.209.131:8080"
```

### 📊 Open the Grafana Monitoring Dashboard

```powershell
Start-Process "http://localhost:3100"
```

*(Make sure the Port-Forward tunnel from section 3 is active in a background terminal first!)*

---

## 🛠️ 5. Jenkins Server Control & Management

*If your teacher asks you to show how to restart or manage the Jenkins build service running on your remote AWS EC2 instance:*

### 🔑 Step 1: Connect to Jenkins EC2 Server via SSH

```powershell
ssh -i <path-to-your-aws-private-key.pem> ubuntu@44.200.209.131
```

*(Replace `<path-to-your-aws-private-key.pem>` with the actual path to your private key file, for example: `d:\WebDev\Keys\vybe-key.pem`)*

### ⚙️ Step 2: Manage the Jenkins Service (Inside the SSH session)

* **Check Service Status:**

  ```bash
  sudo systemctl status jenkins
  ```

* **Restart Jenkins Service:**

  ```bash
  sudo systemctl restart jenkins
  ```

* **Stop Jenkins Service (Save memory):**

  ```bash
  sudo systemctl stop jenkins
  ```

---

## 💡 4. Top 3 "Pro-developer" Explanations for Your Teacher

### 🙋‍♂️ Q1: Why are your pods running on a single replica / single node?
>
> *"To support **Server-Sent Events (SSE) real-time messaging** on a standard memory architecture, user socket streams must land on the same in-memory backend instance. By running a unified replica set and disabling Nginx proxy buffering, we kept the real-time messages flowing instantly without requiring an external Redis broker, optimizing our AWS resource utilization."*

### 🙋‍♂️ Q2: Why did we increase proxy-body-size in Ingress?
>
> *"The default Nginx Ingress Controller caps client requests at 1MB. When users uploaded high-res story images/videos, it resulted in a `413 Request Entity Too Large` error. We resolved this by adding the `nginx.ingress.kubernetes.io/proxy-body-size: 50m` annotation to support media uploads up to 50MB."*

### 🙋‍♂️ Q3: How did we solve the "ERR_INCOMPLETE_CHUNKED_ENCODING" timeout?
>
> *"AWS Load Balancer terminates inactive TCP streams after 60 seconds. To prevent proxy cutoffs, we added a custom 20-second backend keep-alive heartbeat interval (`res.write(':\n\n')`). This maintains a steady heartbeat ping, keeping the TCP connection alive permanently."*

### 🙋‍♂️ Q4: How many Pods are we running, and how does the cluster handle incoming traffic?
>
> *"Our deployment runs a total of **2 application pods** in the default namespace, plus the ingress controller and monitoring stack. The traffic flow routes as follows:"*
>
> 1. **Client Request:** The user types `http://www.bestvybe.live` in their browser.
> 2. **DNS & Load Balancing:** DNS resolves `bestvybe.live` via Name.com to the **AWS Elastic Load Balancer (ELB)**.
> 3. **Ingress Entry:** The ELB routes external port `80` traffic into the cluster to the **Nginx Ingress Controller** pod.
> 4. **Path-Based Routing:** The Ingress controller evaluates rules defined in `ingress.yaml`:
>    * Requests matching `/api/*` are sent to the **`vybe-backend` Service**.
>    * All other requests (e.g. `/`, `/feed`, `/profile`) are sent to the **`vybe-frontend` Service**.
> 5. **Service to Pod Routing:** The Kubernetes services acts as internal load balancers, forwarding requests directly to the target **`vybe-backend`** or **`vybe-frontend`** pod executing on our EKS worker nodes.

### 🙋‍♂️ Q5: What is Kubernetes Ingress, and why do we use it instead of exposing Services directly?
>
> *"Kubernetes Ingress is an API object that manages external access to the services in a cluster, typically HTTP/HTTPS traffic. You can think of it as a **Smart Receptionist** at the entrance of our cluster."*
>
> **Why we use it:**
>
> 1. **Path-Based Routing:** It routes traffic to different services based on the URL path (e.g., sending `/api` to the backend and `/` to the frontend).
> 2. **Cost Savings:** Instead of creating a separate AWS Load Balancer for each service (which is very expensive), Ingress allows us to expose **only one** AWS Load Balancer and perform all routing internally.
> 3. **SSL/TLS Termination:** It can host SSL certificates, decrypting traffic at the entry point before passing it to the internal pods.

### 🙋‍♂️ Q6: How does our AWS EKS cluster handle Scaling under heavy load?
>
> *"Kubernetes scales at two distinct levels to handle high traffic spikes seamlessly:"*
>
> 1. **Pod Scaling (Horizontal Pod Autoscaler - HPA):**
>    * HPA monitors the CPU and Memory metrics of our application pods via the Kubernetes **Metrics Server**.
>    * If resource usage exceeds a target threshold (e.g., 70% CPU usage), HPA automatically spins up additional copies of our pods (replicas) to distribute the load.
> 2. **Node Scaling (Cluster Autoscaler / Karpenter):**
>    * If we run out of physical space on our existing EC2 instances to run the new pods, the **Cluster Autoscaler** contacts the AWS Auto Scaling Group (ASG) to dynamically boot up new EC2 worker nodes.
>    * *Note on our EKS configuration:* In our Terraform code (`eks.tf`), we defined a managed node group with scaling thresholds (`min_size`, `max_size`, `desired_size`) to automate this.
> 3. **Scaling Stateful Real-time Streams (Pro Explanation):**
>    * While scaling stateless frontends is easy, scaling real-time message streams (like Server-Sent Events or WebSockets) across multiple backend pods requires a shared cache/broker (like **Redis Pub/Sub**). This ensures that if User A is connected to Backend Pod 1, and User B is on Backend Pod 2, their messages are still bridged across the pods in real-time.

### 🙋‍♂️ Q7: What is the exact scaling configuration of our Vybe staging setup right now?
>
> *"For our current live staging deployment on `bestvybe.live`, we have configured a **fixed single replica (`replicas: 1`)** for both frontend and backend deployments. This was a deliberate architectural decision for two reasons:"*
>
> 1. **SSE Chat Connection State:**
>    * Because our backend manages live chat sockets inside local Node.js server memory (the `connections` object in `message.controller.js`), running multiple backend pods would split this state.
>    * If User A is on Pod 1 and User B is on Pod 2, they would not be able to exchange messages in real-time. Scaling is capped at 1 replica to keep all active chat sessions on a single memory map.
> 2. **Staging Cost & Capacity Controls:**
>    * Keeping the replica count to 1 prevents the staging cluster from spawning unnecessary extra pods, staying safely within the resource and IP limits of our cost-effective AWS `t3.small` EKS instances.
> 3. **Production Path:**
>    * To scale the backend, we would deploy an external **Redis Pub/Sub instance** to sync chat events across replicas, allowing us to safely increase replica counts.
