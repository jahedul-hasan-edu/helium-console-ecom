import type { AccessTokenPayload } from "../utils/jwtUtil";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      tenantId?: string;
      userId?: string;
    }
  }
}

export {};