import axios from "axios";

export const apiClient = axios.create({
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && !config.url?.startsWith("http")) {
      config.url = `${window.location.origin}/api${config.url}`;
    } else if (!config.url?.startsWith("http")) {
      config.url = `http://localhost:3000/api${config.url}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? "");
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/logout");

    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !isAuthRequest
    ) {
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);
