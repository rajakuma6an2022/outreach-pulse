import { baseApi } from "./api";
import type { ApiEnvelope, Cadence, CreateCadenceBody } from "../types";

export const cadenceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listCadences: build.query<Cadence[], void>({
      query: () => "/cadences",
      transformResponse: (r: ApiEnvelope<Cadence[]>) => r.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Cadence" as const, id })),
              { type: "Cadence" as const, id: "LIST" },
            ]
          : [{ type: "Cadence" as const, id: "LIST" }],
    }),

    createCadence: build.mutation<Cadence, CreateCadenceBody>({
      query: (body) => ({ url: "/cadences", method: "POST", body }),
      transformResponse: (r: ApiEnvelope<Cadence>) => r.data,
      invalidatesTags: [{ type: "Cadence", id: "LIST" }],
    }),
  }),
});

export const { useListCadencesQuery, useCreateCadenceMutation } = cadenceApi;