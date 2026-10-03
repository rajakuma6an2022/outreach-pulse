import { baseApi } from "./api";
import type { ApiEnvelope, CreateEnrollmentBody, EnrollmentItem } from "../types";

export const enrollmentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listEnrollments: build.query<EnrollmentItem[], void>({
      query: () => "/enrollments",
      transformResponse: (r: ApiEnvelope<EnrollmentItem[]>) => r.data,
      providesTags: [{ type: "Enrollment", id: "LIST" }],
    }),

    createEnrollment: build.mutation<unknown, CreateEnrollmentBody>({
      query: (body) => ({ url: "/enrollments", method: "POST", body }),
      invalidatesTags: [{ type: "Enrollment", id: "LIST" }],
    }),
  }),
});

export const { useListEnrollmentsQuery, useCreateEnrollmentMutation } = enrollmentApi;