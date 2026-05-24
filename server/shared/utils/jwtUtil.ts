import jwt, { type SignOptions } from "jsonwebtoken";

export interface AccessTokenPayload {
  userId: string;
  id: string;
  tenantId: string;
  roleId: string;
  roleName: string;
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

export interface PasswordResetPayload {
  userId: string;
  tenantId: string;
}

function getSecret(envKey: "JWT_SECRET" | "REFRESH_TOKEN_SECRET"): string {
  const prefixedKey = `NEXT_PUBLIC_${envKey}` as const;
  const value = process.env[prefixedKey];
  if (value) {
    return value;
  }

  return envKey === "JWT_SECRET"
    ? "dev-jwt-secret-change-me-before-production"
    : "dev-refresh-secret-change-me-before-production";
}

export class JwtUtil {
  private static readonly accessTokenExpiry =
    (process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY || "15m") as SignOptions["expiresIn"];
  private static readonly refreshTokenExpiry =
    (process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY || "7d") as SignOptions["expiresIn"];
  private static readonly tempTokenExpiry = "5m" as SignOptions["expiresIn"];
  private static readonly passwordResetExpiry =
    (process.env.NEXT_PUBLIC_PASSWORD_RESET_EXPIRY || "30m") as SignOptions["expiresIn"];

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

  static generatePasswordResetToken(payload: PasswordResetPayload): string {
    return jwt.sign(payload, getSecret("JWT_SECRET"), {
      expiresIn: this.passwordResetExpiry,
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

  static verifyPasswordResetToken(token: string): PasswordResetPayload {
    return jwt.verify(token, getSecret("JWT_SECRET")) as PasswordResetPayload;
  }
}