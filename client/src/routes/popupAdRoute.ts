/**
 * Popup Ad API Route definitions
 */

export const api = {
  popupAds: {
    list: {
      path: "/api/admin/popup-ads",
    },
    create: {
      path: "/api/admin/popup-ads",
    },
    get: (id: string) => ({
      path: `/api/admin/popup-ads/${id}`,
    }),
    update: (id: string) => ({
      path: `/api/admin/popup-ads/${id}`,
    }),
    delete: (id: string) => ({
      path: `/api/admin/popup-ads/${id}`,
    }),
  },
};
