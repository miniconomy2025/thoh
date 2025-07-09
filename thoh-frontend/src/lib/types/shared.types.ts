export type BaseApiResponse = {
  message: string;
}

export type BaseApiError = {
  error: string;
  details?: unknown;
}