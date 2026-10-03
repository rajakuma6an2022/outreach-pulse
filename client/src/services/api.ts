import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { sessionExpired } from "../features/auth/authActions";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include", // cookie anuppa
});

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === "string" ? args : args.url;

  // /auth/* 401 ku normal (wrong password), so ignore. Matha endpoints 401 na session expire
  if (result.error?.status === 401 && !url.startsWith("/auth/")) {
    api.dispatch(sessionExpired());
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
 tagTypes: ["Prospect", "Cadence"],
  endpoints: () => ({}),
});