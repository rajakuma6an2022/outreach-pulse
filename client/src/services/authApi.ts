import { baseApi } from "./api";
import type { ApiEnvelope, Session } from "../types";

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody extends LoginBody {
  name: string;
  workspaceName: string;
}

const unwrap = (r: ApiEnvelope<Session>) => r.data;

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<Session, void>({
      query: () => "/auth/me",
      transformResponse: unwrap,
    }),
    login: build.mutation<Session, LoginBody>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: unwrap,
    }),
    register: build.mutation<Session, RegisterBody>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: unwrap,
    }),
    logout: build.mutation<unknown, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

export const { useGetMeQuery, useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;