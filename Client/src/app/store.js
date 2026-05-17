import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/User/userSlice.jsx";
import connectionReducer from "../features/Connections/connectionSlice.jsx";
import messageReducer from "../features/Messages/messageSlice.jsx";

export const store = configureStore({
  reducer: {
    user: userReducer,
    connections: connectionReducer,
    messages: messageReducer,
  },
});

