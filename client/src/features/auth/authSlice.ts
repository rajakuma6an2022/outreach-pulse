import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../../services/authApi";
import { sessionExpired } from "./authActions";
import type { AuthUser, Session, Workspace } from "../../types";

type AuthStatus = "unknown" | "authenticated" | "guest";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  workspace: Workspace | null;
}

const initialState: AuthState = { status: "unknown", user: null, workspace: null };

function setSession(state: AuthState, action: PayloadAction<Session>) {
  state.status = "authenticated";
  state.user = action.payload.user;
  state.workspace = action.payload.workspace;
}

function clearSession(state: AuthState) {
  state.status = "guest";
  state.user = null;
  state.workspace = null;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionExpired, clearSession)
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, setSession)
      .addMatcher(authApi.endpoints.login.matchFulfilled, setSession)
      .addMatcher(authApi.endpoints.register.matchFulfilled, setSession)
      .addMatcher(authApi.endpoints.getMe.matchRejected, clearSession)
      .addMatcher(authApi.endpoints.logout.matchFulfilled, clearSession);
  },
});

export default authSlice.reducer;