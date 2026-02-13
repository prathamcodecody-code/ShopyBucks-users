import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

/* ================================
   REQUEST INTERCEPTOR (JWT)
================================ */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================================
   RESPONSE INTERCEPTOR (SAFE)
================================ */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const config = error.config;
    const url = config?.url || "";

    // Normalize URL
    let pathname = url;
    try {
      pathname = new URL(url, config.baseURL).pathname;
    } catch {}

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const currentPath = window.location.pathname;

      // ✅ NEVER redirect on checkout success
      if (currentPath.startsWith("/checkout/success")) {
        return Promise.reject(error);
      }

      // ✅ NEVER redirect for coupon validation
      if (pathname.startsWith("/coupons/validate")) {
        return Promise.reject(error);
      }

      // ✅ NEVER redirect for cart/order placement
      if (pathname.startsWith("/orders")) {
        return Promise.reject(error);
      }

      // 401 → logout only if token exists
      if (status === 401 && token) {
        localStorage.removeItem("token");
        window.location.replace("/");
        return;
      }

      // 403 → redirect ONLY for non-checkout pages
      if (status === 403) {
        window.location.replace("/403");
        return;
      }

      // 404 → optional
      if (status === 404) {
        window.location.replace("/404");
        return;
      }

      // 500+
      if (status >= 500) {
        window.location.replace("/error");
        return;
      }
    }

    return Promise.reject(error);
  }
);
