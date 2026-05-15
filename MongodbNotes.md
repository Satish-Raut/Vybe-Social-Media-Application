# MongoDB Complete Guide — Beginner to Advanced

> A complete reference covering MongoDB fundamentals, daily-use Mongoose patterns, and interview concepts. Suitable for complete beginners and experienced developers alike.

---

## 🌱 Part 1: Fundamentals (For Beginners)

---

### 🔷 What is MongoDB?

**MongoDB** is a **NoSQL database** that stores data as **JSON-like documents** instead of rows and columns like a traditional SQL database (MySQL, PostgreSQL).

Think of it like this:
- In **SQL**, you store data in a rigid **table** with fixed columns.
- In **MongoDB**, you store data in a flexible **document** (like a JavaScript object).

**A MongoDB document looks like this:**
```json
{
  "_id": "64abc123xyz",
  "name": "Satish Raut",
  "email": "satish@vybe.com",
  "age": 22,
  "skills": ["React", "Node.js", "MongoDB"],
  "address": {
    "city": "Pune",
    "state": "Maharashtra"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

> Notice how you can store arrays (`skills`) and nested objects (`address`) directly inside one document — this is impossible in a basic SQL row!

---

### 🔷 Core Terminology

| MongoDB Term | SQL Equivalent | What it means |
|---|---|---|
| **Database** | Database | A container that holds collections |
| **Collection** | Table | A group of related documents (e.g., `users`, `posts`) |
| **Document** | Row / Record | A single data entry stored as JSON |
| **Field** | Column | A key-value pair inside a document |
| **`_id`** | Primary Key | A unique identifier auto-generated for every document |
| **Index** | Index | A performance booster for fast queries |
| **Aggregation** | GROUP BY / JOIN | Powerful data processing pipeline |

---

### 🔷 How MongoDB Stores Data — The Document Model

```
MongoDB Server
│
├── Database: "vybe_db"
│   │
│   ├── Collection: "users"
│   │   ├── Document: { _id: "001", name: "Satish", email: "s@vybe.com" }
│   │   ├── Document: { _id: "002", name: "Jai", email: "j@vybe.com" }
│   │   └── Document: { _id: "003", name: "Priya", email: "p@vybe.com" }
│   │
│   ├── Collection: "posts"
│   │   ├── Document: { _id: "p01", title: "My first post", author: "001" }
│   │   └── Document: { _id: "p02", title: "MongoDB is great", author: "002" }
│   │
│   └── Collection: "comments"
│       └── Document: { _id: "c01", text: "Nice post!", postId: "p01" }
│
└── Database: "another_app_db"
    └── ...
```

---

### 🔷 MongoDB vs SQL — Side by Side

| | SQL (MySQL) | MongoDB |
|---|---|---|
| **Data Format** | Tables & Rows | Documents (JSON) |
| **Schema** | Fixed — must define all columns upfront | Flexible — each document can have different fields |
| **Relationships** | Foreign keys + JOINs | Embedding or `$lookup` |
| **Query Language** | SQL (`SELECT * FROM users WHERE age > 18`) | JavaScript-like (`User.find({ age: { $gt: 18 } })`) |
| **Scalability** | Vertical (upgrade the server) | Horizontal (add more servers — sharding) |
| **Best For** | Banking, finance, rigid structured data | Social media, real-time apps, flexible data |

---

### 🔷 What is the `_id` Field?

Every document in MongoDB **automatically gets a unique `_id` field** when it is created. You don't need to set it manually (unless you want a custom ID like a Clerk User ID).

```json
{
  "_id": "507f1f77bcf86cd799439011",   ← This is an ObjectId (24-character hex string)
  "name": "Satish"
}
```

An **ObjectId** is not just a random string — it encodes:
- 4 bytes: Timestamp of creation
- 5 bytes: Machine + process identifier
- 3 bytes: Random increment counter

This means ObjectIds are **sortable by creation time** and **globally unique** across all machines!

---

### 🔷 Installing MongoDB Locally

**Option A: MongoDB Community Server (Local)**
1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install and start the service
3. Connect using the URI: `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud — Recommended for beginners)**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create a free account
2. Create a **Free Tier Cluster** (M0 — always free)
3. Create a **Database User** with a username and password
4. Add your IP address to the **Network Access** whitelist
5. Click **Connect** → Choose **"Connect your application"**
6. Copy the connection string:
   ```
   mongodb+srv://username:password@cluster0.abc123.mongodb.net/your_db_name
   ```
7. Paste this into your `.env` file as `MONGODB_URI`

> ⚠️ If your password has special characters like `@`, `#`, `!`, you must URL-encode them:
> - `@` → `%40`
> - `#` → `%23`
> - `!` → `%21`

---

### 🔷 What is Mongoose?

**Mongoose** is an **ODM (Object Data Modeling)** library for MongoDB and Node.js. It acts as a bridge between your Node.js code and your MongoDB database.

Without Mongoose, you would write raw MongoDB queries directly. With Mongoose, you can:
- Define a **Schema** to enforce structure on your documents
- Use clean, readable methods like `.find()`, `.save()`, `.populate()`
- Add **validation**, **middleware (hooks)**, and **virtual fields**

```bash
# Install Mongoose in your Node.js project
npm install mongoose
```

**The Mongoose Flow:**
```
Your Node.js App
      │
      │ uses
      ▼
  Mongoose (ODM)
      │
      │ converts to MongoDB commands
      ▼
  MongoDB Database
```

---

### 🔷 Real-World Data Modeling Example

Imagine you are building Vybe (a social media app). How would you model the data?

**Users Collection:**
```json
{
  "_id": "user_clerk_id_001",
  "full_name": "Satish Raut",
  "username": "satishdev",
  "email": "satish@vybe.com",
  "bio": "Developer & Creator",
  "profile_picture": "https://cdn.imagekit.io/vybe/satish.webp",
  "followers": ["user_002", "user_003"],
  "following": ["user_004"],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Posts Collection:**
```json
{
  "_id": "post_001",
  "author": "user_clerk_id_001",     ← Reference to Users collection
  "content": "Just shipped a new feature! 🚀",
  "image": "https://cdn.imagekit.io/vybe/post1.webp",
  "likes": ["user_002", "user_005"],
  "commentCount": 12,
  "createdAt": "2024-03-10T08:00:00Z"
}
```

**Comments Collection:**
```json
{
  "_id": "comment_001",
  "post": "post_001",                ← Reference to Posts collection
  "author": "user_002",              ← Reference to Users collection
  "text": "Amazing! Congrats 🎉",
  "createdAt": "2024-03-10T08:15:00Z"
}
```

> **Design Decision:** `likes` is an embedded array of user IDs — fast to check if a user liked a post. `comments` are in a separate collection — because comments can grow large and have their own properties (likes on comments, replies, etc.).

---

## 🚀 Part 2: Practical Reference (Daily Use)

---

## 📌 Table of Contents
1. [Connection Setup](#1-connection-setup)
2. [Schema & Model](#2-schema--model)
3. [CRUD Operations](#3-crud-operations)
4. [Query Operators](#4-query-operators)
5. [Array Update Operators](#5-array-update-operators)
6. [Sorting, Limiting & Pagination](#6-sorting-limiting--pagination)
7. [Population (Joins)](#7-population-joins)
8. [Aggregation Pipeline](#8-aggregation-pipeline)
9. [Indexing](#9-indexing)
10. [Interview Concepts](#10-interview-concepts)

---

## 1. Connection Setup

```javascript
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Database Connected");
  } catch (error) {
    console.error("❌ Connection Error:", error.message);
    process.exit(1); // Stop the server if DB fails
  }
};

export default connectDB;
```

> **Important:** Always URL-encode special characters in your password.
> Example: `Ghost@435` → `Ghost%40435` in the connection string.

---

## 2. Schema & Model

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Types
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    age:      { type: Number, min: 0, max: 120 },
    isActive: { type: Boolean, default: true },

    // Reference to another collection (like a foreign key)
    role:     { type: mongoose.Schema.Types.ObjectId, ref: "Role" },

    // Array of primitive values
    tags: [String],

    // Array of references
    followers: [{ type: String, ref: "User" }],

    // Nested object
    address: {
      city:    String,
      country: String,
    },

    // Enum — only allow specific values
    status: {
      type: String,
      enum: ["pending", "active", "banned"],
      default: "pending",
    },
  },
  {
    timestamps: true,  // Adds createdAt & updatedAt automatically
    minimize: false,   // Don't remove empty objects from saved documents
  }
);

const User = mongoose.model("User", userSchema);
export default User;
```

---

## 3. CRUD Operations

### ➕ Create
```javascript
// Create one document
const user = await User.create({ name: "Satish", email: "s@test.com" });

// Create multiple documents at once
const users = await User.insertMany([{ name: "A" }, { name: "B" }]);
```

### 🔍 Read
```javascript
// Find all matching documents
const users = await User.find({ isActive: true });

// Find one document
const user = await User.findOne({ email: "s@test.com" });

// Find by MongoDB _id
const user = await User.findById("64abc123...");

// Find only specific fields (projection)
const user = await User.findOne({ email: "s@test.com" }, "name email -_id");
// 'name email' = include these, '-_id' = exclude _id
```

### ✏️ Update
```javascript
// Find and update — returns the UPDATED document
const user = await User.findByIdAndUpdate(
  id,
  { name: "New Name" },
  { returnDocument: "after" } // Use this! { new: true } is deprecated.
);

// Update one matching document (does NOT return the document)
await User.updateOne({ email: "s@test.com" }, { $set: { isActive: false } });

// Update many matching documents
await User.updateMany({ isActive: false }, { $set: { status: "banned" } });
```

### 🗑️ Delete
```javascript
// Find and delete — returns the deleted document
const deleted = await User.findByIdAndDelete(id);

// Delete one matching document
await User.deleteOne({ email: "s@test.com" });

// Delete many matching documents
await User.deleteMany({ isActive: false });
```

---

## 4. Query Operators

```javascript
// Comparison
User.find({ age: { $gt: 18 } });       // greater than
User.find({ age: { $gte: 18 } });      // greater than or equal
User.find({ age: { $lt: 60 } });       // less than
User.find({ age: { $lte: 60 } });      // less than or equal
User.find({ age: { $ne: 25 } });       // not equal
User.find({ status: { $in: ["active", "pending"] } });    // in array
User.find({ status: { $nin: ["banned"] } });              // not in array

// Logical
User.find({ $and: [{ age: { $gt: 18 } }, { isActive: true }] });
User.find({ $or:  [{ age: { $lt: 13 } }, { age: { $gt: 65 } }] });
User.find({ age:  { $not: { $gt: 18 } } });

// Element
User.find({ address: { $exists: true } });   // field exists
User.find({ age: { $type: "number" } });     // field is of type

// Regex / Text Search
User.find({ name: /satish/i });              // simple regex
User.find({ name: new RegExp(input, "i") }); // dynamic regex (always escape input first!)

// Escape user input before using in Regex to prevent crashes:
const safe = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
User.find({ name: new RegExp(safe, "i") });
```

---

## 5. Array Update Operators

These are the SAFE way to update arrays — avoid `.push()` + `.save()` for concurrent updates!

```javascript
// $push — Adds an element (allows duplicates)
await User.findByIdAndUpdate(id, { $push: { tags: "nodejs" } });

// $addToSet — Adds an element ONLY IF it doesn't already exist (prevents duplicates)
await User.findByIdAndUpdate(id, { $addToSet: { followers: targetId } });

// $pull — Removes all elements that match a condition
await User.findByIdAndUpdate(id, { $pull: { followers: targetId } });

// $pop — Removes the first (-1) or last (1) element
await User.findByIdAndUpdate(id, { $pop: { tags: 1 } });

// $each — Used with $push or $addToSet to add multiple elements
await User.findByIdAndUpdate(id, {
  $addToSet: { tags: { $each: ["react", "node"] } }
});
```

> **Why use `$addToSet` and `$pull` instead of `.push()` + `.save()`?**
> MongoDB performs these as a single atomic operation. With `.push()` + `.save()`, if two users hit the same endpoint at the same millisecond, one save can overwrite the other (race condition). Atomic operators are always safer.

---

## 6. Sorting, Limiting & Pagination

```javascript
// Sort ascending (1) or descending (-1)
const users = await User.find().sort({ createdAt: -1 }); // newest first

// Limit results
const users = await User.find().limit(10);

// Skip results (for pagination)
const page = 2;
const limit = 10;
const users = await User.find()
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)  // skip 10 for page 2
  .limit(limit);

// Count documents
const total = await User.countDocuments({ isActive: true });
```

---

## 7. Population (Joins)

Mongoose `populate()` replaces an ObjectId reference with the actual document from another collection.

```javascript
// Schema with a reference
const postSchema = new mongoose.Schema({
  author:   { type: String, ref: "User" },  // stores the user's _id
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

// Populate a single field
const post = await Post.findById(id).populate("author");
// post.author is now the full User object, not just an ID!

// Populate multiple fields at once
const post = await Post.findById(id).populate("author comments");

// Populate with field selection (only get name and email from the User)
const post = await Post.findById(id).populate("author", "name email -_id");

// Nested population (populate inside a populated document)
const post = await Post.findById(id).populate({
  path: "comments",
  populate: { path: "author", select: "name" }
});
```

---

## 8. Aggregation Pipeline

The aggregation pipeline processes documents through a series of **stages**. Each stage transforms the data.

```javascript
const result = await User.aggregate([

  // Stage 1: $match — Filter documents (like .find())
  { $match: { isActive: true, age: { $gte: 18 } } },

  // Stage 2: $group — Group documents and calculate aggregates
  {
    $group: {
      _id: "$status",             // group by the 'status' field
      totalUsers: { $sum: 1 },    // count users in each group
      avgAge:     { $avg: "$age" } // average age per group
    }
  },

  // Stage 3: $sort — Sort the results
  { $sort: { totalUsers: -1 } },

  // Stage 4: $limit — Limit results
  { $limit: 5 },

  // Stage 5: $project — Shape the output (include/exclude fields)
  { $project: { _id: 0, status: "$_id", totalUsers: 1, avgAge: 1 } },

  // Stage 6: $lookup — Join with another collection (like SQL JOIN)
  {
    $lookup: {
      from: "posts",          // the collection to join
      localField: "_id",      // field in current collection
      foreignField: "author", // field in the 'posts' collection
      as: "userPosts"         // name of the new array field
    }
  },

  // Stage 7: $unwind — Flatten an array field (one doc per array element)
  { $unwind: "$userPosts" },

  // Stage 8: $addFields — Add a new computed field
  { $addFields: { fullName: { $concat: ["$firstName", " ", "$lastName"] } } },

]);
```

---

## 9. Indexing

Indexes make queries faster by allowing MongoDB to scan an index instead of every document.

```javascript
// Single field index
userSchema.index({ email: 1 });      // 1 = ascending, -1 = descending

// Unique index (prevents duplicate values)
userSchema.index({ username: 1 }, { unique: true });

// Compound index (for queries that filter on multiple fields)
userSchema.index({ status: 1, createdAt: -1 });

// Text index (for full-text search)
userSchema.index({ name: "text", bio: "text" });
// Then query with:
User.find({ $text: { $search: "satish developer" } });

// TTL Index — automatically deletes documents after a time period
// (Great for sessions, OTP tokens, etc.)
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 }); // 1 hour
```

> **Rule of Thumb:** Add an index on any field you frequently use in `.find()`, `.sort()`, or `.findOne()`. But don't over-index — every index slows down writes.

---

## 10. Interview Concepts

### ❓ What is MongoDB? How is it different from SQL?
| Feature | MongoDB (NoSQL) | SQL (Relational) |
|---|---|---|
| Data format | JSON-like documents | Tables with rows & columns |
| Schema | Flexible (schemaless) | Fixed, rigid schema |
| Relationships | Embedding or referencing | Joins across tables |
| Scalability | Horizontal (sharding) | Vertical (bigger server) |
| Transactions | Supported (multi-doc) | Native ACID transactions |
| Best for | Unstructured, flexible data | Structured, relational data |

---

### ❓ What is the difference between Embedding and Referencing?

**Embedding** — Store related data inside the same document.
```javascript
// Good for: data that is always read together, small sub-documents
{
  name: "Satish",
  address: { city: "Pune", state: "MH" }  // embedded
}
```

**Referencing** — Store the `_id` of another document (like a foreign key).
```javascript
// Good for: large sub-documents, data shared between many documents
{
  name: "Satish",
  posts: ["64abc...", "64def..."]  // references to Post documents
}
```

> **Rule:** Embed when you always need the data together. Reference when the data grows large or is shared.

---

### ❓ What is a Replica Set?
A **Replica Set** is a group of MongoDB servers that maintain the same data. One is the **Primary** (handles reads and writes), and the others are **Secondaries** (backup copies). If the Primary goes down, a Secondary is automatically elected as the new Primary. This provides **high availability** and **automatic failover**. MongoDB Atlas uses Replica Sets by default.

---

### ❓ What is Sharding?
**Sharding** is MongoDB's method of **horizontal scaling** — splitting a large dataset across multiple servers (shards). Each shard holds a subset of the data. A **shard key** is chosen to determine how data is distributed. Used when a single server cannot handle the data volume or throughput.

---

### ❓ What is the Aggregation Pipeline?
The aggregation pipeline is a framework for data processing where documents pass through a series of **stages** (`$match`, `$group`, `$sort`, `$project`, `$lookup`, etc.). Each stage transforms the data before passing it to the next. It is more powerful than simple queries and is used for analytics, reporting, and complex data transformations.

---

### ❓ What is an Index? Why are they important?
An **index** is a special data structure that stores a small portion of the collection's data in an easy-to-traverse form. Without an index, MongoDB must do a **collection scan** (read every document). With an index, it can jump directly to the matching documents. This dramatically speeds up read queries but slightly slows down writes (because the index must also be updated).

---

### ❓ What is a Mongoose Middleware / Hook?
Mongoose allows you to define functions that run **before** (`pre`) or **after** (`post`) certain operations like `save`, `find`, `deleteOne`, etc.

```javascript
// Hash password before saving a user
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Log after a document is deleted
userSchema.post("deleteOne", function (doc) {
  console.log(`User ${doc._id} was deleted`);
});
```

---

### ❓ What is the difference between `find()` and `findOne()`?
- `find()` always returns an **array** of matching documents (empty array if none found).
- `findOne()` returns the **first** matching document, or `null` if not found.

---

### ❓ What is the difference between `save()` and `findByIdAndUpdate()`?
- `save()` fetches the full document, modifies it in memory, then writes the entire document back. It triggers Mongoose middleware (`pre save`, `post save`). Slower, but fires hooks.
- `findByIdAndUpdate()` sends a direct update command to MongoDB without fetching the document first. Faster, but **does NOT trigger `pre/post save` hooks**. Use `$set` and other operators directly.

---

### ❓ What does `{ returnDocument: "after" }` do?
It tells Mongoose to return the document **after** the update is applied, so you get the new values. The old option `{ new: true }` is now deprecated in newer Mongoose versions.

---

### ❓ What is a Race Condition in MongoDB? How to prevent it?
A race condition happens when two operations read and write the same document at nearly the same time, causing one to overwrite the other.

**Example:** Two users follow a third user at the same millisecond. Both read `followers: ["A"]`, both push their ID, and both save. The second save overwrites the first, resulting in only one follower being added instead of two.

**Solution:** Use MongoDB's **atomic operators** (`$addToSet`, `$push`, `$pull`, `$inc`) which MongoDB handles safely in a single atomic operation at the database level.

```javascript
// ✅ Safe — atomic operation, no race condition
await User.findByIdAndUpdate(id, { $addToSet: { followers: newFollowerId } });
```

---

*This document will be updated as new concepts are encountered.*
