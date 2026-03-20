import jwt, { type SignOptions } from "jsonwebtoken";
import type { RoleName } from "server/shared/constants/enums";

export interface AccessTokenPayload {
  userId: string;
  id: string;
  tenantId: string;
  roleId: string;
  roleName: RoleName;
  sessionId: string;
  subscriptionExpiresAt?: string;
}

export interface RefreshTokenPayload {
  sessionId: string;
  userId: string;
  tenantId: string;
}

export interface TwoFactorTempPayload {
  userId: string;
  tenantId: string;
}

function getSecret(envKey: "JWT_SECRET" | "REFRESH_TOKEN_SECRET"): string {
  const value = process.env[envKey];
  if (value) {
    return value;
  }

  return envKey === "JWT_SECRET"
    ? "dev-jwt-secret-change-me-before-production"
    : "dev-refresh-secret-change-me-before-production";
}

export class JwtUtil {
  private static readonly accessTokenExpiry = (process.env.ACCESS_TOKEN_EXPIRY || "15m") as SignOptions["expiresIn"];
  private static readonly refreshTokenExpiry = (process.env.REFRESH_TOKEN_EXPIRY || "7d") as SignOptions["expiresIn"];
  private static readonly tempTokenExpiry = "5m" as SignOptions["expiresIn"];

  static generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, getSecret("JWT_SECRET"), {
      expiresIn: this.accessTokenExpiry,
      subject: payload.userId,
    });
  }

  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, getSecret("REFRESH_TOKEN_SECRET"), {
      expiresIn: this.refreshTokenExpiry,
      subject: payload.userId,
    });
  }

  static generateTwoFactorTempToken(payload: TwoFactorTempPayload): string {
    return jwt.sign(payload, getSecret("JWT_SECRET"), {
      expiresIn: this.tempTokenExpiry,
      subject: payload.userId,
    });
  }

  static verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, getSecret("JWT_SECRET")) as AccessTokenPayload;
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, getSecret("REFRESH_TOKEN_SECRET")) as RefreshTokenPayload;
  }

  static verifyTwoFactorTempToken(token: string): TwoFactorTempPayload {
    return jwt.verify(token, getSecret("JWT_SECRET")) as TwoFactorTempPayload;
  }
}