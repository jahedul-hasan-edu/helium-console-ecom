export const api = {
  popupAds: {
    list: { method: 'GET', path: '/api/admin/popup-ads' },
    create: { method: 'POST', path: '/api/admin/popup-ads' },
    get: { method: 'GET', path: '/api/admin/popup-ads/:id' },
    update: { method: 'PATCH', path: '/api/admin/popup-ads/:id' },
    delete: { method: 'DELETE', path: '/api/admin/popup-ads/:id' },
  },
};
