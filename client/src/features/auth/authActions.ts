import { createAction } from "@reduxjs/toolkit";

// API oru 401 kudutha (session expire), auth slice idha kettu logout state-ku poidum
export const sessionExpired = createAction("auth/sessionExpired");