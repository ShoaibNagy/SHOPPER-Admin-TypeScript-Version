// =============================================================================
// Shared API Types
// =============================================================================
// These types model the standard envelope the backend sends for every response
// and the common query-param shapes used for list endpoints.
// =============================================================================

// ---------------------------------------------------------------------------
// Standard backend response envelope
// { success: true, data: T, message?: string }
// { success: false, message: string, errors?: FieldError[] }
// ---------------------------------------------------------------------------
export interface ApiResponse<T> {
    readonly success: boolean;
    readonly data: T;
    readonly message?: string;
    readonly errors?: FieldError[];
  }
  
  export interface FieldError {
    readonly field: string;
    readonly message: string;
  }
  
  // ---------------------------------------------------------------------------
  // Normalised error thrown by the Axios interceptor
  // ---------------------------------------------------------------------------
  export interface ApiError {
    readonly message: string;
    readonly status: number;
    readonly errors: FieldError[];
  }
  
  // ---------------------------------------------------------------------------
  // Paginated list response wrapper
  // ---------------------------------------------------------------------------
  export interface PaginatedResponse<T> {
    readonly items: T[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  }
  
  // ---------------------------------------------------------------------------
  // Common query params for list endpoints
  // ---------------------------------------------------------------------------
  export interface ListParams {
    readonly page?: number;
    readonly limit?: number;
    readonly search?: string;
    readonly sortBy?: string;
    readonly sortOrder?: 'asc' | 'desc';
  }
  
  // ---------------------------------------------------------------------------
  // MongoDB ObjectId — string on the wire
  // ---------------------------------------------------------------------------
  export type ObjectId = string;
  
  // ---------------------------------------------------------------------------
  // ISO-8601 date string — what Mongoose serialises to JSON
  // ---------------------------------------------------------------------------
  export type ISODateString = string;
  
  // ---------------------------------------------------------------------------
  // Generic select option (used by <Select> components)
  // ---------------------------------------------------------------------------
  export interface SelectOption<T extends string = string> {
    readonly label: string;
    readonly value: T;
  }