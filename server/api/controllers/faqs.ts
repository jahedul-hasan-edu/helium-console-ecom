import type { Express } from "express";
import { faqService } from "../../service/faq_service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ResponseHandler } from "server/shared/utils/ResponseHandler";
import { api } from "../routes/faqRoute";
import { HTTP_STATUS, FAQ_MESSAGES, FAQ_SORT_FIELDS } from "server/shared/constants";

export async function registerFaqRoutes(app: Express): Promise<void> {
  // GET - List all FAQs with pagination, sorting, and search
  app.get(
    api.faqs.list.path,
    asyncHandler(async (req, res) => {
      const response = await faqService.getFaqs(req);

      ResponseHandler.paginated(
        res,
        response.items,
        response.total,
        response.page,
        response.pageSize,
        FAQ_MESSAGES.FAQS_RETRIEVED_SUCCESSFULLY,
        HTTP_STATUS.OK
      );
    })
  );

  // POST - Create a new FAQ
  app.post(
    api.faqs.create.path,
    asyncHandler(async (req, res) => {
      const faq = await faqService.createFaq(req);
      ResponseHandler.success(res, FAQ_MESSAGES.FAQ_CREATED_SUCCESSFULLY, faq, HTTP_STATUS.CREATED);
    })
  );

  // GET - Get a single FAQ by ID
  app.get(
    api.faqs.get.path,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const tenantId = (req as any).tenantId || "0027d5b0-9a89-48f0-95fd-2228294ff053";
      
      const faq = await faqService.getFaq(id, tenantId);

      if (!faq) {
        return ResponseHandler.error(res, FAQ_MESSAGES.FAQ_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      ResponseHandler.success(res, FAQ_MESSAGES.FAQ_RETRIEVED_SUCCESSFULLY, faq, HTTP_STATUS.OK);
    })
  );

  // PATCH - Update a FAQ
  app.patch(
    api.faqs.update.path,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      
      const faq = await faqService.updateFaq(id, req);

      if (!faq) {
        return ResponseHandler.error(res, FAQ_MESSAGES.FAQ_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      ResponseHandler.success(res, FAQ_MESSAGES.FAQ_UPDATED_SUCCESSFULLY, faq, HTTP_STATUS.OK);
    })
  );

  // DELETE - Delete a FAQ
  app.delete(
    api.faqs.delete.path,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const tenantId = (req as any).tenantId || "0027d5b0-9a89-48f0-95fd-2228294ff053";
      
      await faqService.deleteFaq(id, tenantId);

      ResponseHandler.success(res, FAQ_MESSAGES.FAQ_DELETED_SUCCESSFULLY, { success: true }, HTTP_STATUS.OK);
    })
  );
}
