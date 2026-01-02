import axios from 'axios';

// 根據環境自動選擇 API URL
// 生產環境：使用環境變數或默認後端 URL
// 開發環境：使用 localhost
const getApiUrl = () => {
  // 如果明確設置了環境變數，使用它
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 如果在 Vercel 上（生產環境），需要後端 URL
  // 注意：後端也需要部署到某個地方（如 Railway, Render 等）
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // 生產環境：需要設置 NEXT_PUBLIC_API_URL 環境變數指向部署的後端
    console.warn('⚠️ 生產環境需要設置 NEXT_PUBLIC_API_URL 環境變數指向後端服務器');
    // 暫時返回 localhost（這在生產環境不會工作，需要部署後端）
    return 'http://localhost:3001';
  }
  
  // 開發環境：使用 localhost
  return 'http://localhost:3001';
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 請求攔截器：添加 token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 響應攔截器：處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 網絡錯誤（後端未運行）
    if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
      console.error('無法連接到後端服務器，請確保後端正在運行 (http://localhost:3001)');
      // 不自動跳轉，讓用戶看到錯誤訊息
    } else if (error.response?.status === 401) {
      // Token 過期，清除並跳轉到登入頁
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API 函數
export const authAPI = {
  login: (provider: string, token: string) =>
    api.post('/auth/login', { provider, token }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/users/me'),
};

export const eventAPI = {
  // Public APIs
  list: (params?: any) => api.get('/events/search', { params }),
  detail: (id: string) => api.get(`/events/${id}`),
  // Organizer APIs
  getOrganizerEvents: (params?: any) => api.get('/events/organizer', { params }),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  publish: (id: string) => api.post(`/events/${id}/publish`),
  getStats: (id: string) => api.get(`/events/${id}/stats`),
  createTicketType: (eventId: string, data: any) => api.post(`/events/${eventId}/ticket-types`, data),
  updateTicketType: (eventId: string, ticketTypeId: string, data: any) => api.put(`/events/${eventId}/ticket-types/${ticketTypeId}`, data),
  toggleTicketTypeListing: (eventId: string, ticketTypeId: string) => api.post(`/events/${eventId}/ticket-types/${ticketTypeId}/toggle-listing`),
};

export const orderAPI = {
  create: (data: any) => api.post('/orders', data),
  pay: (orderId: string, data: any) => api.post(`/orders/${orderId}/pay`, data),
  detail: (orderId: string) => api.get(`/orders/${orderId}`),
};

export const ticketAPI = {
  list: (params?: any) => api.get('/users/tickets', { params }),
  detail: (ticketId: string) => api.get(`/tickets/${ticketId}`),
};

export const verificationAPI = {
  verify: (data: { ticketId: string; eventId: string; verifierId?: string }) =>
    api.post('/verification/verify', data),
};

export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

