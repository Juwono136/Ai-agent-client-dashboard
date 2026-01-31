import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/users/userSlice";
import agentReducer from "../features/agents/agentSlice";
import platformReducer from "../features/platforms/platformSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    agents: agentReducer,
    platforms: platformReducer,
  },
});
