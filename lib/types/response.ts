export type AppResponse<T> = {
  data: T | null;
  error?: string;
};

export type ErrorResponse = {
  message: string;
};
