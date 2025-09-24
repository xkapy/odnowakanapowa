import type { JWTPayload } from "../db/database";

export interface AppContext {
  Variables: {
    user: JWTPayload;
  };
}
