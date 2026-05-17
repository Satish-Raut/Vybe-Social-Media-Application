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
