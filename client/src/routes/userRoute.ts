
export const api = {
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/users',
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/users',
    },
    get: {
      method: 'GET' as const,
      path: (id:string)=> `/api/admin/users/${id}`,
    },
    update: {
      method: 'PATCH' as const,
      path: (id:string)=> `/api/admin/users/${id}`,
    },
    delete: {
      method: 'DELETE' as const,
      path: (id:string)=> `/api/admin/users/${id}`,
    },
    checkEmail: {
      method: 'GET' as const,
      path: (email: string) => `/api/admin/users/check-email?email=${encodeURIComponent(email)}`,
    },
  },
};