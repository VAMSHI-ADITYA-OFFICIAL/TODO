// server/axiosInstance.ts
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_ENDPOINT_URL;
if (!BACKEND_URL) throw new Error("NEXT_PUBLIC_ENDPOINT_URL not defined");

// Create an Axios instance
export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // for cookies (refresh token)
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.info("Request sent to:", config.url);
    // if (!config.url?.includes("/login") && !config.url?.includes("/signup")) {
    //   const token = getAccessToken(); // e.g., from memory or server session
    //   if (token) {
    //     config.headers!["Authorization"] = `Bearer ${token}`;
    //   }
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // e.g., handle refresh token logic
      console.error("Unauthorized, maybe refresh token expired");
    }
    return Promise.reject(error);
  }
);
