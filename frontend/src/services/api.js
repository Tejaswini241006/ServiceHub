import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 / token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const resp = await axios.post("/api/auth/refresh", {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const { access_token, refresh_token } = resp.data.data;
        localStorage.setItem("access_token", access_token);
        if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
        processQueue(null, access_token);
        original.headers.Authorization = `Bearer ${access_token}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Show error toast for non-401 errors
    const message = error.response?.data?.message || "Something went wrong";
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// ---- Services ----
export const servicesAPI = {
  list: (params) => api.get("/services", { params }),
  get: (id) => api.get(`/services/${id}`),
  search: (params) => api.get("/services/search", { params }),
  create: (data) => api.post("/services", data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  uploadImage: (id, formData) =>
    api.post(`/services/${id}/image`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  categories: () => api.get("/categories"),
};

// ---- Bookings ----
export const bookingsAPI = {
  create: (data) => api.post("/bookings", data),
  myBookings: (params) => api.get("/bookings/my", { params }),
  providerBookings: (params) => api.get("/bookings/provider", { params }),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.delete(`/bookings/${id}`),
  review: (id, data) => api.post(`/bookings/${id}/review`, data),
};

// ---- Providers ----
export const providersAPI = {
  dashboard: () => api.get("/providers/dashboard"),
  updateProfile: (data) => api.put("/providers/profile", data),
  updateAvailability: (data) => api.patch("/providers/availability", data),
  get: (id) => api.get(`/providers/${id}`),
  getServices: (id, params) => api.get(`/providers/${id}/services`, { params }),
};

// ---- Admin ----
export const adminAPI = {
  users: (params) => api.get("/admin/users", { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  providers: (params) => api.get("/admin/providers", { params }),
  approveProvider: (id) => api.patch(`/admin/providers/${id}/approve`),
  suspendProvider: (id) => api.patch(`/admin/providers/${id}/suspend`),
  bookings: (params) => api.get("/admin/bookings", { params }),
  stats: () => api.get("/admin/stats"),
  createCategory: (data) => api.post("/admin/categories", data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};

export default api;
