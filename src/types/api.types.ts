// Standardized API types for consistent request/response handling

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Response wrapper
export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: StandardApiError;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

// Error response
export interface StandardApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
  stack?: string; // Only in development
}

// Validation error
export interface ValidationError extends StandardApiError {
  field: string;
  value?: any;
  constraints: string[];
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

// Paginated response
export interface PaginatedApiResponse<T> extends StandardApiResponse<T[]> {
  pagination: PaginationMeta;
}

// Sort options
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// Filter options
export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike';
  value: any;
}

// Query parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortOption[];
  filters?: FilterOption[];
  search?: string;
  include?: string[];
  fields?: string[];
}

// API request configuration
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: QueryParams;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

// API client response
export interface ApiClientResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: ApiRequestConfig;
}

// Bulk operations
export interface BulkOperation<T = any> {
  action: 'create' | 'update' | 'delete';
  data: T;
  id?: number | string;
}

export interface BulkRequest<T = any> {
  operations: BulkOperation<T>[];
}

export interface BulkResponse<T = any> {
  success: boolean;
  results: BulkOperationResult<T>[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface BulkOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: StandardApiError;
  operation: BulkOperation<T>;
}

// File upload
export interface FileUploadRequest {
  file: File;
  filename?: string;
  folder?: string;
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
  uploadedAt: string;
}

// Health check
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// API versioning
export interface ApiVersion {
  version: string;
  deprecated?: boolean;
  deprecationDate?: string;
  supportedUntil?: string;
  migrationGuide?: string;
}

// Webhook payload
export interface WebhookPayload<T = any> {
  id: string;
  event: string;
  timestamp: string;
  data: T;
  signature?: string;
  version: string;
}

// Search results
export interface SearchResult<T = any> {
  item: T;
  score: number;
  highlights?: Record<string, string[]>;
}

export interface SearchResponse<T = any> extends PaginatedApiResponse<SearchResult<T>> {
  query: string;
  took: number;
  facets?: Record<string, SearchFacet>;
}

export interface SearchFacet {
  name: string;
  values: SearchFacetValue[];
}

export interface SearchFacetValue {
  value: string;
  count: number;
  selected?: boolean;
}

// Cache control
export interface CacheControl {
  maxAge?: number;
  sMaxAge?: number;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  etag?: string;
  lastModified?: string;
}

// API metrics
export interface ApiMetrics {
  endpoint: string;
  method: HttpMethod;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  userId?: number;
  userAgent?: string;
  ip?: string;
} 