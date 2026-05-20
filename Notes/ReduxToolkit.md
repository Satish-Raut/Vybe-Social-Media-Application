# Redux Toolkit (RTK) Complete Guide

> A comprehensive, beginner-to-advanced reference guide for Redux Toolkit. Perfect for refreshing your memory before jumping into the frontend of Vybe.

---

## 📌 Table of Contents
1. [What is Redux Toolkit?](#1-what-is-redux-toolkit)
2. [Installation](#2-installation)
3. [The Core Workflow](#3-the-core-workflow)
4. [Step 1: Creating a Slice](#4-step-1-creating-a-slice)
5. [Step 2: Configuring the Store](#5-step-2-configuring-the-store)
6. [Step 3: Providing the Store](#6-step-3-providing-the-store)
7. [Step 4: Using Data in Components](#7-step-4-using-data-in-components)
8. [Handling Async Logic (API Calls)](#8-handling-async-logic-api-calls-createasyncthunk)
9. [Best Practices for Vybe](#9-best-practices-for-vybe-project-structure)
10. [Common Interview Questions](#10-common-interview-questions)

---

## 1. What is Redux Toolkit?

**Redux** is a state management library. It acts as a global "store" for your entire application, meaning any component can access the data without needing to pass `props` down through 10 levels of components (prop drilling).

**Redux Toolkit (RTK)** is the modern, official, and recommended way to write Redux. 
In the old days, Redux required massive amounts of boilerplate code (switch statements, separate action files, action types, immutable updates). **RTK solves all of this:**
- No more switch statements.
- You can write "mutating" code (like `state.value += 1`) because RTK uses the `Immer` library under the hood to automatically handle immutability safely.
- Actions and Reducers are bundled together into **"Slices"**.

---

## 2. Installation

Install Redux Toolkit and the React-Redux bindings:

```bash
npm install @reduxjs/toolkit react-redux
```

---

## 3. The Core Workflow

1. **Store:** The global database for your frontend.
2. **Slice:** A piece of the store (e.g., `userSlice`, `postSlice`, `themeSlice`).
3. **Dispatch:** The function you call to trigger a change.
4. **Action:** What you are trying to do (e.g., `LIKE_POST`).
5. **Reducer:** The function that actually updates the state based on the action.
6. **Selector:** How you read data from the store into your component.

---

## 4. Step 1: Creating a Slice

A "Slice" is a collection of Redux reducer logic and actions for a single feature of your app.

**`src/redux/slices/userSlice.js`**
```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
};

const userSlice = createSlice({
  name: 'user', // Name of the slice
  initialState, // Initial state defined above
  reducers: {
    // Action 1: Login Success
    loginSuccess: (state, action) => {
      state.currentUser = action.payload; // action.payload contains the data passed to the action
      state.isAuthenticated = true;
    },
    // Action 2: Logout
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
    // Action 3: Update Profile Picture
    updateProfilePic: (state, action) => {
      // 💡 RTK Magic: We can "mutate" the state directly here!
      if (state.currentUser) {
        state.currentUser.profile_picture = action.payload;
      }
    }
  },
});

// Export the actions so components can use them
export const { loginSuccess, logout, updateProfilePic } = userSlice.actions;

// Export the reducer so the store can use it
export default userSlice.reducer;
```

---

## 5. Step 2: Configuring the Store

Combine all your slices into one central store.

**`src/redux/store.js`**
```javascript
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import postReducer from './slices/postSlice'; // Example second slice

const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
  },
});

export default store;
```

---

## 6. Step 3: Providing the Store

Wrap your React application with the Redux `Provider` so all components can access the store.

**`src/main.jsx` (or `index.js`)**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { Provider } from 'react-redux';
import store from './redux/store.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

---

## 7. Step 4: Using Data in Components

You will use two hooks:
- `useSelector`: To **read** data from the store.
- `useDispatch`: To **send actions** to update the store.

**`src/components/Navbar.jsx`**
```javascript
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/userSlice';

const Navbar = () => {
  // 1. Read data using useSelector
  const { currentUser, isAuthenticated } = useSelector((state) => state.user);
  
  // 2. Setup dispatch
  const dispatch = useDispatch();

  const handleLogout = () => {
    // 3. Dispatch an action
    dispatch(logout());
  };

  return (
    <nav>
      {isAuthenticated ? (
        <div>
          <img src={currentUser.profile_picture} alt="Profile" />
          <span>{currentUser.full_name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button>Login</button>
      )}
    </nav>
  );
};

export default Navbar;
```

---

## 8. Handling Async Logic (API Calls) - `createAsyncThunk`

In a social media app like Vybe, you'll be making a lot of API calls (fetching posts, liking, commenting). Redux Toolkit provides `createAsyncThunk` to handle these asynchronous requests easily.

**`src/redux/slices/postSlice.js`**
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Create the Async Thunk
export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeed',
  async (_, { rejectWithValue }) => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.get('/api/posts/feed');
      return response.data.posts; // This becomes the action.payload on success
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    feed: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Synchronous actions go here (like liking a post instantly in UI)
    optimisticLike: (state, action) => {
      const post = state.feed.find(p => p._id === action.payload);
      if (post) post.likes_count.push("my_user_id");
    }
  },
  // 2. Handle the Async Thunk Lifecycle in extraReducers
  extraReducers: (builder) => {
    builder
      // When the API call starts
      .addCase(fetchFeedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // When the API call succeeds
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.feed = action.payload; // Data returned from the thunk
      })
      // When the API call fails
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Error message
      });
  },
});

export const { optimisticLike } = postSlice.actions;
export default postSlice.reducer;
```

**Using the Thunk in a Component:**
```javascript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedPosts } from '../redux/slices/postSlice';

const Feed = () => {
  const dispatch = useDispatch();
  const { feed, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchFeedPosts());
  }, [dispatch]);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {feed.map(post => <PostCard key={post._id} data={post} />)}
    </div>
  );
};
```

---

## 9. Best Practices for Vybe (Project Structure)

For a scalable project, group your Redux logic by **feature**.

```
src/
├── redux/
│   ├── store.js              # The central store config
│   ├── slices/
│   │   ├── userSlice.js      # Auth, profile data, connections
│   │   ├── postSlice.js      # Feed, creating posts, liking
│   │   ├── chatSlice.js      # Messages, unread counts
│   │   └── uiSlice.js        # Global UI states (dark mode, modals)
```

---

## 10. Common Interview Questions

### ❓ What is Redux Toolkit and why use it over basic Redux?
RTK is the official, opinionated, batteries-included toolset for efficient Redux development. It reduces boilerplate code, automatically configures the Redux DevTools, and uses the `Immer` library allowing you to write mutating logic (`state.value = 1`) which safely updates state immutably under the hood.

### ❓ What is the difference between `reducers` and `extraReducers` in a slice?
- `reducers`: Used for defining synchronous actions that are strictly tied to that specific slice (e.g., toggling a modal, clearing a form). RTK automatically generates action creators for these.
- `extraReducers`: Used for handling actions created outside the slice, such as async actions created with `createAsyncThunk`, or responding to actions dispatched from *other* slices.

### ❓ What is Prop Drilling and how does Redux solve it?
Prop drilling is passing data down through multiple nested components that don't need the data themselves, just to get it to a deeply nested child. Redux solves this by creating a global store; any component, regardless of its position in the tree, can read data directly using `useSelector`.

### ❓ What is a Thunk?
A Thunk is a middleware that allows you to write action creators that return a function instead of an action object. This function can contain asynchronous logic (like API calls) and can dispatch regular synchronous actions based on the API response. In RTK, we use `createAsyncThunk`.

### ❓ Can we mutate state in Redux?
In traditional Redux, **NO**. State is immutable.
In Redux Toolkit, **YES (syntactically)**. Because RTK uses the `Immer` library, you can write code that *looks* like it mutates the state (`state.user = payload`), but Immer intercepts it and safely produces a new immutable state object behind the scenes.

### ❓ What is RTK Query?
RTK Query is an optional, advanced data fetching and caching tool included within Redux Toolkit. It is designed to simplify common cases for loading data in a web application (like React Query or SWR), automatically managing loading states, caching data, and avoiding duplicate requests.

### ❓ How does `useSelector` know when to re-render a component?
`useSelector` subscribes to the Redux store. When an action is dispatched, Redux updates the global state. `useSelector` then compares the *old* value it was returning with the *new* value using strict equality (`===`). If the value has changed, it forces the React component to re-render. 

### ❓ What is the Flux Architecture?
Flux is an architectural pattern created by Facebook for building UIs. Redux is heavily inspired by Flux. The core idea is **unidirectional data flow**: 
`Action -> Dispatcher -> Store -> View`. 
Data only ever flows in one direction, making the application more predictable and easier to debug.

### ❓ What are Middlewares in Redux?
Middlewares provide a third-party extension point between dispatching an action and the moment it reaches the reducer. They are used for logging, crash reporting, routing, and handling asynchronous actions (like `redux-thunk` or `redux-saga`).

### ❓ How do you persist Redux state across page reloads?
Redux state lives in memory, meaning a page refresh wipes it out. To persist it, you use a library like **`redux-persist`**, which automatically saves your Redux store to `localStorage` or `sessionStorage` and rehydrates the store when the application loads.

---

## 11. Practical / Scenario-Based Interview Questions

### 💻 Scenario 1: The "Janky UI" Problem
**Question:** A user clicks "Like" on a post. The API takes 2 seconds to respond. The user has to wait 2 seconds before the heart icon turns red. This feels slow and janky. How do you fix this using Redux?
**Answer:** I would use an **Optimistic Update**. 
1. When the user clicks "Like", immediately dispatch a synchronous action to update the Redux state (turning the heart red instantly).
2. Dispatch the async API call (`createAsyncThunk`) in the background.
3. If the API call fails (rejected), dispatch another action to revert the Redux state back to its original value (turning the heart back to white) and show an error toast.

### 💻 Scenario 2: The "Over-rendering" Problem
**Question:** Look at this code. What is the performance problem here?
```javascript
const userProfile = useSelector(state => {
  return { name: state.user.name, age: state.user.age }
});
```
**Answer:** This will cause **unnecessary re-renders every single time ANY action is dispatched** in the entire app. 
`useSelector` uses strict equality (`===`) to check if the returned value changed. Because this selector returns a *brand new object literal* `{}` every time it runs, Redux thinks the state has changed (because `{} !== {}` in JavaScript memory), forcing a re-render.
**The Fix:** Return primitive values, or use multiple selectors:
```javascript
const name = useSelector(state => state.user.name);
const age = useSelector(state => state.user.age);
```

### 💻 Scenario 3: The "Where does it go?" Problem
**Question:** You are building a dropdown menu. You need to track whether the dropdown is `isOpen` (true/false). Should you put `isOpen` in Redux or local React state (`useState`)?
**Answer:** It should go in **local React state (`useState`)**. 
Redux is for **global** state (data shared across many different components, like the currently logged-in user or a feed of posts). A simple dropdown open/close toggle is isolated to one component and doesn't need to be accessed anywhere else. Putting it in Redux is over-engineering and adds unnecessary boilerplate.

### 💻 Scenario 4: The "Huge List" Problem
**Question:** You have an array of 5,000 posts in Redux. Your component renders a list of 5,000 `<PostCard />` components. Updating the `likes_count` of *one* post causes all 5,000 components to re-render. How do you optimize this?
**Answer:** I would normalize the state shape. Instead of an array `[{id: 1}, {id: 2}]`, I would store the data as an object dictionary (Lookup Table):
```javascript
posts: {
  byId: {
    "post_1": { id: "post_1", likes: 10 },
    "post_2": { id: "post_2", likes: 5 }
  },
  allIds: ["post_1", "post_2"]
}
```
Then, the parent list component only renders the `allIds` array (passing just the ID to the child). The child `<PostCard id="post_1" />` component uses its own `useSelector(state => state.posts.byId[id])` to fetch its exact data. This way, updating one post only re-renders that specific child component, not the whole list! (RTK provides `createEntityAdapter` specifically for this).
