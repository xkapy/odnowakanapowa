// Type declarations for Bun built-in modules
declare module "bun:sqlite" {
  export default class Database {
    constructor(filename?: string);
    query(sql: string): {
      get(...params: any[]): any;
      all(...params: any[]): any[];
      run(...params: any[]): { lastInsertRowid: number | bigint; changes: number };
    };
    exec(sql: string): void;
    close(): void;
  }
}

declare module "bun" {
  export const version: string;
}
