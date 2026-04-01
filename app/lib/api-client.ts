import axios from "axios";

// Criar cliente sem base URL - vamos usar a URL completa em cada requisição
export const apiClient = axios.create({
  withCredentials: true,
});

// Adicionar interceptor para adicionar a URL base dinamicamente
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && !config.url?.startsWith("http")) {
      // Se está no navegador e a URL não é completa, adicionar origin
      config.url = `${window.location.origin}/api${config.url}`;
    } else if (!config.url?.startsWith("http")) {
      // No servidor, usar localhost (não deve acontecer normalmente)
      config.url = `http://localhost:3000/api${config.url}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth state
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);
