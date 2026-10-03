export function getErrorMessage(error: unknown): string {
  const e = error as
    | { status?: unknown; data?: { message?: string }; message?: string }
    | undefined;

  if (e?.data?.message) return e.data.message;
  if (e?.status === "FETCH_ERROR") return "Cannot reach the server. Is the API running?";
  if (e?.message) return e.message;
  return "Something went wrong";
}