# Vybe Platform — Technical Notes

---

## How Real-Time Messaging Works in Vybe

Vybe implements real-time messaging using a technique called **Server-Sent Events (SSE)**, which is a native web technology built on top of HTTP. This is a lightweight, one-way communication channel from the **server → client**, which is perfect for a chat notification/delivery system.

> **Why SSE and not WebSockets?**
> WebSockets provide full-duplex (two-way) communication but are more complex to set up and scale. For a social chat feature where the *client sends* via a normal API call (POST) and only needs to *receive* via the server, SSE is a simpler, more efficient, and natively browser-supported solution.

---

### The Architecture at a Glance

```
User A (Sender)                    Server (Node/Express)              User B (Receiver)
     |                                       |                               |
     |  1. Opens App                         |                               |
     |---------- GET /api/message/:userId ---|-------- Persistent SSE -------|
     |                                       |   Connection stored in memory |
     |                                       |                               |
     |  2. Types message & clicks Send       |                               |
     |---------- POST /api/message/send ---->|                               |
     |                                       |  3. Saves to MongoDB          |
     |                                       |  4. Pushes via SSE ---------->|
     |          5. response.json { message } |                               |
     |<--------------------------------------|                               |
     |  Sender's UI updated via Redux        |      Receiver's UI updated    |
     |                                       |      via Redux dispatch       |
```

---

### Step-by-Step Breakdown

#### Step 1: Establishing the Persistent SSE Connection

When any authenticated user opens the Vybe application, `App.jsx` immediately opens a long-lived HTTP connection to the backend using the browser's native `EventSource` API:

```js
// Client: src/App.jsx
const eventSource = new EventSource(
  import.meta.env.VITE_BASEURL + '/api/message/' + user.id
);
```

This single `GET` request never closes on its own — the browser holds the connection open permanently (as long as the user's tab is open).

On the **server side**, the `sseController` in `message.controller.js` handles this request:

```js
// Server: Controllers/message.controller.js
const connections = {}; // In-memory store of all active clients

export const sseController = (req, res) => {
  const { userId } = req.params;

  // 1. Set special HTTP headers to tell the browser "this is a stream"
  res.setHeader('content-type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 2. Store the `res` object — this is the "pipe" to that specific user's browser
  connections[userId] = res;

  // 3. Listen for disconnection and clean up
  req.on('close', () => {
    delete connections[userId];
  });
};
```

The key insight is `connections[userId] = res`. The server stores the **response object** for every connected user in a simple dictionary keyed by their Clerk `userId`. As long as the user has the app open, the server holds this "pipe" open and can push data through it at any moment.

---

#### Step 2: Sending a Message (Client → Server)

When User A types a message and clicks **Send** in `ChatBox.jsx`, the client makes a standard HTTP `POST` request to the backend — this is just a normal API call, nothing special:

```js
// Client: src/Pages/ChatBox.jsx
const formData = new FormData();
formData.append('to_user_id', userId);
formData.append('text', text);
if (image) formData.append('image', image); // Optional media

const { data } = await api.post('/api/message/send', formData, {
  headers: { Authorization: `Bearer ${token}` }
});

// On success, update the SENDER's own UI immediately via Redux
if (data.success) {
  dispatch(addMessages(data.message));
}
```

The sender's own screen is updated synchronously via Redux immediately after the server confirms success — no waiting required.

---

#### Step 3: Delivering the Message in Real-Time (Server → Receiver)

Inside the `sendMessage` controller, after saving the message to MongoDB, the server checks if the **recipient** currently has an open SSE connection:

```js
// Server: Controllers/message.controller.js
export const sendMessage = async (req, res) => {
  // ... auth, image upload, save to DB ...

  const message = await Message.create({ from_user_id, to_user_id, text, ... });

  // Send HTTP response back to the SENDER
  res.json({ success: true, message });

  // Enrich the saved message with the sender's full profile (name, picture, etc.)
  // NOTE: This does NOT check if the receiver is online — it only fetches data from MongoDB.
  const messageWithUserData = await Message.findById(message._id)
    .populate('from_user_id');

  // THIS is the actual online check: connections[to_user_id] exists ONLY if the receiver
  // has the app open. If the key is missing, they are offline — we skip the SSE push,
  // and the message will be fetched from MongoDB when they open the chat later.
  if (connections[to_user_id]) {
    // Push the enriched message through the receiver's open SSE pipe
    connections[to_user_id].write(
      `data: ${JSON.stringify(messageWithUserData)}\n\n`
    );
  }
};
```

The `\n\n` at the end is mandatory — it is part of the SSE text-stream format and signals the end of one complete event to the browser.

---

#### Step 4: Receiving & Displaying the Message (Client — Receiver)

Back on the client, the `EventSource` in `App.jsx` has an `onmessage` handler that fires every time data is pushed through the SSE pipe:

```js
// Client: src/App.jsx
eventSource.onmessage = (event) => {
  const message = JSON.parse(event.data);

  // Is the receiver currently viewing this specific chat?
  if (pathNameRef.current === '/messages/' + message.from_user_id._id) {
    // YES → Append the message to the chat instantly via Redux
    dispatch(addMessages(message));
  } else {
    // NO → Show a popup notification toast instead
    toast.custom((t) => <Notification t={t} message={message} />, {
      duration: 4000,
      position: 'bottom-right'
    });
  }
};
```

A `useRef` (`pathNameRef`) is used instead of `useState` for the current route because `ref` values are always current inside the `onmessage` closure, whereas `useState` values would be stale (captured at the time the `EventSource` was created).

---

#### Step 5: Notification vs. Live Chat Update

The system is context-aware — it behaves differently based on where the recipient is in the app:

| Recipient's Location | Result |
|---|---|
| `/messages/:senderId` (the specific chat) | Message appended live to the chat via Redux |
| Anywhere else (Feed, Profile, Discover, etc.) | A popup notification appears with the sender's avatar and message preview |

Clicking the notification automatically dismisses it and navigates the user to the correct chat.

---

### Image/Media Message Flow

When an image is attached, the server performs additional steps before pushing through SSE:

1. **Multer** receives the file and temporarily saves it to the server's disk.
2. The file is streamed to **ImageKit** for cloud hosting and CDN delivery.
3. ImageKit returns a public `url` for the file.
4. The server uses `imageKit.helper.buildSrc()` to generate an optimized URL (auto format WebP, max width 1280px).
5. The temporary file on the server's disk is deleted with `fs.unlinkSync()`.
6. The `media_url` (the ImageKit CDN URL) is stored in MongoDB and pushed via SSE.

```js
// Server: Controllers/message.controller.js
const stream = fs.createReadStream(image.path);
const response = await imageKit.files.upload({ file: stream, fileName: image.originalname });

media_url = imageKit.helper.buildSrc({
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  src: response.url,
  transformation: [{ width: '1280', crop: 'maintain_ratio', quality: 'auto', format: 'webp' }],
});

fs.unlinkSync(image.path); // Clean up temp file
```

---

### Data Flow Summary Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VYBE MESSAGE FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

[User Opens App]
      │
      ▼
EventSource("/api/message/:userId")  ──────────►  sseController()
      │                                             stores res in
      │                                             connections[userId]
      │
[User Types & Sends Message]
      │
      ▼
POST "/api/message/send"  ──────────────────────►  sendMessage()
      │                                             1. Auth via Clerk
      │                                             2. Upload image to ImageKit (if any)
      │                                             3. Save Message to MongoDB
      │                                             4. Send HTTP response to sender
      │◄──────────────────────────────────────────  { success: true, message }
      │
      │                                             5. Look up connections[to_user_id]
      │                                             6. Push via SSE pipe ──────────────►
      │                                                                         onmessage()
      │                                                                             │
      │                                                         Is user in the chat? │
      │                                                         YES ─► dispatch(addMessages)
      │                                                         NO  ─► toast.custom(<Notification />)
      │
[Redux State Updated]
      │
      ▼
[React Re-renders Chat UI with new message]
```

---

### Key Files Reference

| File | Role |
|---|---|
| `Server/Controllers/message.controller.js` | SSE setup, `sendMessage` push logic, `getUserRecentMessages` |
| `Server/Models/Message.js` | Mongoose schema for all chat messages |
| `Server/Routes/userRoutes.js` | Defines `/recent-messages` route |
| `Client/src/App.jsx` | Opens SSE connection, routes incoming messages to Redux or Notification |
| `Client/src/Pages/ChatBox.jsx` | UI for sending/receiving messages, reads from Redux |
| `Client/src/Components/Notification.jsx` | Custom toast popup for background notifications |
| `Client/src/Components/RecentMessages.jsx` | Sidebar widget, polls `/api/user/recent-messages` every 30s |
| `Client/src/features/Messages/messageSlice.jsx` | Redux slice managing the active chat's message array |

---

## ❓ DevOps Doubts & Clarifications

### Q: Why isn't MongoDB containerized in our Docker Compose setup?
**A:** Because the project uses **MongoDB Atlas** (a managed cloud database), there is no need to run a local MongoDB database inside a Docker container. 
The Dockerized Node.js backend is "stateless." It connects to the cloud database securely over the internet by reading the `MONGO_URI` from the `.env` file, which is injected into the backend container via the `env_file` directive in `docker-compose.yml`. Keeping the database outside of your app containers is a major DevOps best practice!

### Q: What do the different Kubernetes (K8s) YAML files actually do?
**A:** We created 6 K8s manifest files in the `k8s/` directory. Here is what each one is responsible for:
1. **`secret.yaml`**: Securely holds our environment variables (like `MONGO_URI` and `CLERK_SECRET_KEY`) instead of keeping them in `.env` files on the cloud. K8s will automatically protect them and inject them into our containers.
2. **`backend-deployment.yaml` & `frontend-deployment.yaml`**: These act as the "managers." They tell Kubernetes to run exactly 2 copies (replicas) of your Docker containers. If a container crashes, the Deployment instantly spins up a new one (Self-Healing).
3. **`backend-service.yaml` & `frontend-service.yaml`**: Because Pod IPs change every time they restart, Services provide a *permanent, stable internal IP address* so the frontend can always reliably communicate with the backend.
4. **`ingress.yaml`**: The "Traffic Cop" or Reverse Proxy. It sits at the edge of the cluster and routes external internet traffic based on the URL (e.g., routing traffic starting with `/api` to the backend service, and all other traffic to the frontend service).

### Q: What is Terraform and how does it work compared to the AWS Console?
**A:** Terraform is an "Infrastructure as Code" (IaC) tool. 
* **The Old Way (AWS Console):** You log into the AWS website and click dozens of buttons to manually create networks, servers, and security groups. It's slow and prone to human error.
* **The Terraform Way:** You write a blueprint (the `.tf` files). Terraform reads the blueprint and automatically connects to AWS to build it exactly as written.

### Q: What do the different parts of our Terraform code do?
**A:** Our files are built on three main concepts:
1. **Providers (`provider.tf`)**: Tells Terraform *who* to talk to (e.g., AWS, Google Cloud).
2. **Resources (`vpc.tf`, `ecr.tf`, `jenkins.tf`)**: A specific, single item you want to build, like an `aws_instance` (EC2 server) or `aws_vpc` (network).
3. **Modules (`eks.tf`)**: A pre-packaged bundle of resources. Instead of manually writing 30+ IAM roles for an EKS cluster, we use the official AWS module which handles it for us safely in a few lines of code.

### Q: What is the standard Terraform workflow?
**A:** Terraform operates safely using 4 main commands:
1. **`terraform init`**: Downloads the necessary plugins (like the AWS provider) to your computer.
2. **`terraform plan`**: A dry-run. Terraform calculates exactly what it will create or delete *before* touching your AWS account.
3. **`terraform apply`**: Executes the plan and actually builds the resources on AWS.
4. **`terraform destroy`**: Safely deletes all the resources created by your code so you don't get charged money after your project is done.

### Q: What are the main AWS Services we built with Terraform?
**A:** We provisioned three major AWS components to host our application:
1. **VPC (Virtual Private Cloud)**: This is your private, isolated network inside AWS. Think of it as the secure building where all your servers live.
2. **EKS (Elastic Kubernetes Service)**: This is AWS's managed Kubernetes service. It consists of a "Control Plane" (master servers that AWS manages) and a "Node Group" (the actual EC2 worker servers where our Vybe app containers run).
3. **ECR (Elastic Container Registry)**: This is your private version of DockerHub hosted on AWS. It is where we upload and securely store the `vybe-frontend` and `vybe-backend` Docker images so EKS can pull them.

### Q: Why do I see a "Default" VPC and a Custom VPC in my AWS account?
**A:** 
* **The Default VPC:** Every AWS account automatically comes with one Default VPC pre-built in every region (e.g., `172.31.0.0/16`). AWS does this so beginners can click "Launch EC2" and have it work immediately without knowing networking.
* **Our Custom VPC:** In professional DevOps environments, you **never** use the Default VPC. It is bad practice because it isn't customized for specific security needs. We used `vpc.tf` to build our own highly secure, custom network (`10.0.0.0/16`) specifically designed for our EKS cluster.
