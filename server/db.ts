import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as tenantSchemas from "./db/schemas/tenants";
import * as userSchemas from "./db/schemas/users";
import * as mainCategorySchemas from "./db/schemas/mainCategories";
import * as categorySchemas from "./db/schemas/categories";
import * as subCategorySchemas from "./db/schemas/subCategories";
import * as subSubCategorySchemas from "./db/schemas/subSubCategories";
import * as productSchemas from "./db/schemas/products";
import * as productImageSchemas from "./db/schemas/productImages";
import * as cartSchemas from "./db/schemas/carts";
import * as cartItemSchemas from "./db/schemas/cartItems";
import * as orderSchemas from "./db/schemas/orders";
import * as orderItemSchemas from "./db/schemas/orderItems";
import * as addressSchemas from "./db/schemas/addresses";
import * as deliverySlotSchemas from "./db/schemas/deliverySlots";
import * as paymentSchemas from "./db/schemas/payments";
import * as subscriptionPlanSchemas from "./db/schemas/subscriptionPlans";
import * as tenantSubscriptionSchemas from "./db/schemas/tenantSubscriptions";
import * as popupAdSchemas from "./db/schemas/popupAds";
import * as roleSchemas from "./db/schemas/roles";
import * as userRoleSchemas from "./db/schemas/userRoles";
import * as pageSchemas from "./db/schemas/pages";
import * as tenantPageSchemas from "./db/schemas/tenantPages";
import * as tenantRolePageSchemas from "./db/schemas/tenantRolePages";
import * as tenantRolePagePermissionSchemas from "./db/schemas/tenantRolePagePermissions";
import * as sessionSchemas from "./db/schemas/sessions";
import * as refreshTokenSchemas from "./db/schemas/refreshTokens";

const schema = {
  ...tenantSchemas,
  ...userSchemas,
  ...mainCategorySchemas,
  ...categorySchemas,
  ...subCategorySchemas,
  ...subSubCategorySchemas,
  ...productSchemas,
  ...productImageSchemas,
  ...cartSchemas,
  ...cartItemSchemas,
  ...orderSchemas,
  ...orderItemSchemas,
  ...addressSchemas,
  ...deliverySlotSchemas,
  ...paymentSchemas,
  ...subscriptionPlanSchemas,
  ...tenantSubscriptionSchemas,
  ...popupAdSchemas,
  ...roleSchemas,
  ...userRoleSchemas,
  ...pageSchemas,
  ...tenantPageSchemas,
  ...tenantRolePageSchemas,
  ...tenantRolePagePermissionSchemas,
  ...sessionSchemas,
  ...refreshTokenSchemas,
};

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
