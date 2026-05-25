import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// withCredentials: true — o navegador envia os cookies HttpOnly automaticamente
// em cada requisição. O JavaScript não tem acesso de leitura aos tokens.
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Mutex de refresh: garante que apenas uma chamada de refresh acontece por vez.
// Se múltiplos requests perceberem o token expirado simultaneamente,
// apenas o primeiro faz o refresh — os demais aguardam e reutilizam o novo cookie.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            // O cookie refresh é enviado automaticamente pelo navegador.
            // O backend lê o cookie, gera novo access e seta novo cookie HttpOnly.
            await axios.post(`${BASE_URL}/refresh/`, {}, { withCredentials: true });
            return true;
        } catch {
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

// Interceptor de resposta: trata erros 401 (token expirado)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Evita loop infinito: não tenta refresh para rotas de auth nem para /me/
        const isAuthRoute = ["/login/", "/refresh/", "/logout/", "/me/"].some(
            (route) => originalRequest?.url?.includes(route)
        );

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
            originalRequest._retry = true;

            const refreshed = await tryRefreshToken();

            if (refreshed) {
                // Novo cookie access já foi setado pelo backend — tenta de novo
                return api(originalRequest);
            } else {
                // Refresh falhou — redireciona para login
                window.location.href = "/";
                return Promise.reject(new Error("Sessão expirada. Faça login novamente."));
            }
        }

        return Promise.reject(error);
    }
);

export default api;
