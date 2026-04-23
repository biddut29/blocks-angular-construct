// ─── API Response Types ────────────────────────────────────────────────────────
// Mirrors the GraphQL + REST response shapes from the React project

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNo: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  pageNo: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface HttpErrorPayload {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
