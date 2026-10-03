import { baseApi } from "./api";
import type {
  ApiEnvelope,
  CreateProspectBody,
  ListProspectsArgs,
  Pagination,
  Prospect,
  ProspectList,
} from "../types";

export const prospectApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listProspects: build.query<ProspectList, ListProspectsArgs>({
      query: (params) => ({ url: "/prospects", params }),
      transformResponse: (r: { data: Prospect[]; pagination: Pagination }) => ({
        items: r.data,
        pagination: r.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Prospect" as const, id })),
              { type: "Prospect" as const, id: "LIST" },
            ]
          : [{ type: "Prospect" as const, id: "LIST" }],
    }),

    createProspect: build.mutation<Prospect, CreateProspectBody>({
      query: (body) => ({ url: "/prospects", method: "POST", body }),
      transformResponse: (r: ApiEnvelope<Prospect>) => r.data,
      invalidatesTags: [{ type: "Prospect", id: "LIST" }],
    }),

    deleteProspect: build.mutation<unknown, string>({
      query: (id) => ({ url: `/prospects/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Prospect", id: "LIST" }],
    }),
  }),
});

export const { useListProspectsQuery, useCreateProspectMutation, useDeleteProspectMutation } =
  prospectApi;