import axios, { InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const api = axios.create({ baseURL: BASE_URL });

// Mutex de refresh: garante que apenas uma chamada de refresh acontece por vez.
// Se múltiplos requests perceberem o token expirado simultaneamente,
// apenas o primeiro faz o refresh — os demais aguardam e reutilizam o novo token.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const refresh = localStorage.getItem("refresh");
            if (!refresh) return null;

            const response = await axios.post(`${BASE_URL}/refresh/`, { refresh });
            const newToken = response.data.access;
            if (newToken) {
                localStorage.setItem("access", newToken);
                return newToken;
            }
            return null;
        } catch {
            return null;
        } finally {
            // Libera o mutex após o refresh (com ou sem sucesso)
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem("access");

    if (!token) return config;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);

        if (payload.exp < now) {
            const newToken = await refreshAccessToken();

            if (!newToken) {
                // Refresh falhou — sessão encerrada
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("user");
                window.location.href = "/";
                return Promise.reject(new Error("Sessão expirada. Faça login novamente."));
            }

            token = newToken;
        }

        config.headers = config.headers ?? {};
        (config.headers as any)["Authorization"] = `Bearer ${token}`;

        return config;
    } catch (e) {
        console.error("Erro no interceptor de auth:", e);
        return config;
    }
});

export default api;

