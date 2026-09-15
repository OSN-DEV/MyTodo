export interface IpcError {
  code: string;
  message: string;
}

export type IpcResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: IpcError };
