export interface Response<T> {
  message: ListResponse<T> | ObjectResponse<T> | UploadResponse<T>;
}
export interface UploadResponse<T> extends ListResponse<T> {
  label: string;
}

export interface ListResponse<T> {
  list: [T];
  count: number;
}
export interface ObjectResponse<T> {
  object: T;
}

export interface ErrorResponse {
  message: string;
  timestamp: string;
  log: string;
}

export interface Record {
  name: string;
  score: number;
}
