export {};

declare global {
  type TBackendError = {
    statusCode: number;
    message: string | string[];
    error: string;
  };
}
