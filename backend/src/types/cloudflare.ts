// Types for Cloudflare Workers environment
export interface CloudflareEnv {
  DB: D1Database;
  JWT_SECRET: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_FIRST_NAME: string;
  ADMIN_LAST_NAME: string;
  ENVIRONMENT: string;
  DATABASE_INITIALIZED?: boolean;
}

export interface CloudflareAppContext {
  Bindings: CloudflareEnv;
}

// D1 Database types (Cloudflare's SQLite)
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: {
    duration: number;
    size_after: number;
    rows_read: number;
    rows_written: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}
