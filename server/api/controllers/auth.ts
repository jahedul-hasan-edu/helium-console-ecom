import type { Express } from "express";
import rateLimit from "express-rate-limit";
import { HTTP_STATUS } from "server/shared/constants";
import { authMiddleware } from "server/shared/middleware/authMiddleware";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { asyncHandler } from "server/shared/utils/asyncHandler";
import { authService } from "server/service/auth_service";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerAuthRoutes(app: Express): Promise<void> {
  app.post(
    "/api/auth/login",
    authLimiter,
    asyncHandler(async (req, res) => {
      const response = await authService.login(req);
      ResponseHandler.success(res, "Login successful", response, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/verify-2fa",
    authLimiter,
    asyncHandler(async (req, res) => {
      const response = await authService.verifyTwoFactor(req);
      ResponseHandler.success(res, "Two-factor verification successful", response, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/refresh",
    authLimiter,
    asyncHandler(async (req, res) => {
      const { refreshToken } = req.body as { refreshToken?: string };
      const response = await authService.refresh(refreshToken || "", req);
      ResponseHandler.success(res, "Token refreshed", response, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/logout",
    authMiddleware,
    asyncHandler(async (req, res) => {
      await authService.logout(req);
      ResponseHandler.success(res, "Logged out successfully", null, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/logout-all-sessions",
    authMiddleware,
    asyncHandler(async (req, res) => {
      await authService.logoutAll(req);
      ResponseHandler.success(res, "Logged out from all sessions", null, HTTP_STATUS.OK);
    })
  );

  app.get(
    "/api/auth/me",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const user = await authService.getCurrentUser(req);
      ResponseHandler.success(res, "Current user retrieved successfully", user, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/2fa/setup",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const response = await authService.setupTwoFactor(req);
      ResponseHandler.success(res, "2FA setup initialized", response, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/2fa/verify-setup",
    authMiddleware,
    asyncHandler(async (req, res) => {
      await authService.verifyTwoFactorSetup(req);
      ResponseHandler.success(res, "2FA enabled successfully", null, HTTP_STATUS.OK);
    })
  );

  app.post(
    "/api/auth/2fa/disable",
    authMiddleware,
    asyncHandler(async (req, res) => {
      await authService.disableTwoFactor(req);
      ResponseHandler.success(res, "2FA disabled successfully", null, HTTP_STATUS.OK);
    })
  );
}