import type { Express } from "express";
import { userService } from "../../service/user_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { api } from "../routes/userRoute";
import { PAGINATION_DEFAULTS, HTTP_STATUS, USER_MESSAGES, USER_SORT_FIELDS } from "server/shared/constants";

export async function registerUserRoutes(app: Express): Promise<void> {
  app.get(
    api.users.list.path,
    asyncHandler(async (req, res) => {
      const response = await userService.getUsers(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        USER_MESSAGES.USERS_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  app.get(
    "/api/admin/users/check-email",
    asyncHandler(async (req, res) => {
      const email = req.query.email as string;
      
      if (!email) {
        return ResponseHandler.error(res, "Email is required", HTTP_STATUS.BAD_REQUEST);
      }

      const existingUser = await userService.checkEmailExists(email);
      
      ResponseHandler.success(
        res,
        "Email check completed",
        { exists: !!existingUser, user: existingUser || null },
        HTTP_STATUS.OK
      );
    })
  );

  app.post(
    api.users.create.path,
    asyncHandler(async (req, res) => {
      const user = await userService.createUser(req);
      ResponseHandler.success(res, USER_MESSAGES.USER_CREATED_SUCCESSFULLY, user, HTTP_STATUS.CREATED);
    })
  );

  app.get(
    api.users.get.path,
    asyncHandler(async (req, res) => {
      const user = await userService.getUser(req.params.id);
      if (!user) {
        return ResponseHandler.error(res, USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      ResponseHandler.success(res, USER_MESSAGES.USER_RETRIEVED_SUCCESSFULLY, user, HTTP_STATUS.OK);
    })
  );

  app.patch(
    api.users.update.path,
    asyncHandler(async (req, res) => {
      const user = await userService.updateUser(req.params.id, req.body, req);
      ResponseHandler.success(res, USER_MESSAGES.USER_UPDATED_SUCCESSFULLY, user, HTTP_STATUS.OK);
    })
  );

  app.delete(
    api.users.delete.path,
    asyncHandler(async (req, res) => {
      await userService.deleteUser(req.params.id);
      ResponseHandler.success(res, USER_MESSAGES.USER_DELETED_SUCCESSFULLY, null, HTTP_STATUS.OK);
    })
  );
}
