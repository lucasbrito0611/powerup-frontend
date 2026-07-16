'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

import { loginSchema, LoginSchemaType } from "@/schemas/loginSchema";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/toast";
import api from "@/services/api";
import EsqueceuSenhaModal from "@/components/modals/EsqueceuSenhaModal";

export default function LoginClient() {
    const { login, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");

    const { register, handleSubmit, formState: { errors } } = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
        mode: "onChange"
    });

    const onSubmit = async (data: LoginSchemaType) => {
        try {
            const response = await api.post("/login/", {
                email: data.email,
                password: data.senha,
            });

            const novoUsuario = response.data;

            // --- LÓGICA DE VERIFICAÇÃO DE ADMIN ---
            if (redirect && redirect.includes("/admin")) {
                if (novoUsuario.perfil !== 'admin') {
                    notify("Esta conta não possui permissão de administrador.", "error");
                    return; 
                }
            }

            login({ 
                id: novoUsuario.id, 
                nome: novoUsuario.nome, 
                email: novoUsuario.email, 
                perfil: novoUsuario.perfil,
                has_password: novoUsuario.has_password,
            });
            
            notify(`Bem-vindo, ${novoUsuario.nome}!`, "success");

            setTimeout(() => {
                redirect ? router.push(redirect) : router.push("/")
            }, 1000);

        } catch (error: any) {
            console.error("Erro ao fazer login:", error.response?.data || error.message);
            notify("Email ou senha incorretos.", "error");
        }
    };

    const handleGoogleSuccess = async (tokenResponse: { access_token: string }) => {
        try {
            const response = await api.post("/auth/google/", {
                access_token: tokenResponse.access_token,
            });

            const novoUsuario = response.data;

            if (redirect && redirect.includes("/admin")) {
                if (novoUsuario.perfil !== 'admin') {
                    notify("Esta conta não possui permissão de administrador.", "error");
                    return;
                }
            }

            login({
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                perfil: novoUsuario.perfil,
                has_password: novoUsuario.has_password,
            });

            notify(`Bem-vindo, ${novoUsuario.nome}!`, "success");

            setTimeout(() => {
                window.location.href = redirect ?? "/";
            }, 1000);

        } catch (error: any) {
            console.error("Erro no login com Google:", error.response?.data || error.message);
            notify("Não foi possível entrar com o Google. Tente novamente.", "error");
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => notify("Login com Google cancelado ou falhou.", "error"),
    });

    const onError = (errors: FieldErrors<LoginSchemaType>) => {
        const firstError = Object.values(errors)[0];

        if (firstError && "message" in firstError) {
            notify(firstError.message as string, "warning");
        } else {
            notify("Erro ao validar dados", "warning");
        }
    };

    return (
        <main className="flex relative h-screen">
            <section className="relative nt-sm:w-[60%] w-full flex flex-col justify-center items-center bg-white rounded-r-3xl z-20">
                <div className="nt-lg:w-[50%] w-3/4 space-y-15 flex flex-col items-center">
                    <h3 className="mb-lg:text-2xl text-xl text-center font-semibold">BEM VINDO DE VOLTA!</h3>
                    <div className="w-full space-y-10">

                        <form id="login-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-7">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className="font-semibold mb-lg:text-lg">E-MAIL</label>
                                <input {...register("email")} type="email" name="email" id="email" placeholder="Digite seu e-mail" className="input px-3 py-2.5 rounded-md" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="senha" className="font-semibold mb-lg:text-lg">SENHA</label>
                                <input {...register("senha")} type="password" name="senha" id="senha" placeholder="Digite sua senha" className="input px-3 py-2.5 rounded-md" />
                            </div>
                        </form>

                        <div className="flex justify-between items-center">
                            <Button
                                type="submit"
                                form="login-form"
                                variant="submit"
                                size="submit"
                            >
                                Entrar
                            </Button>

                            <EsqueceuSenhaModal />
                        </div>

                        {/* Divisor */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-sm text-gray-400 font-medium">ou</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* Botão Google */}
                        <button
                            type="button"
                            id="google-login-btn"
                            onClick={() => loginWithGoogle()}
                            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-md py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer shadow-sm"
                        >
                            {/* Logo Google SVG oficial */}
                            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.4 30.2 0 24 0 14.6 0 6.6 5.5 2.6 13.6l7.8 6.1C12.3 13.4 17.7 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
                                <path fill="#FBBC05" d="M10.4 28.6A14.9 14.9 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6L2.5 13.4A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6.1z"/>
                                <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.7 2.2-7.7 2.2-6.3 0-11.7-4-13.6-9.4l-7.8 6.1C6.5 42.5 14.6 48 24 48z"/>
                            </svg>
                            Entrar com Google
                        </button>
                    </div>
                    <a href="/cadastro" className="text-center mb-lg:text-lg font-semibold text-dark-green hover:underline">
                        Não tem uma conta? Cadastre-se
                    </a>
                </div>
                <p className="absolute top-10 left-1/2 -translate-x-1/2 text-dark-green mb-lg:text-xl text-lg font-semibold">
                    Login
                </p>
            </section>
            <section className="hidden nt-sm:block z-10 w-[41%] absolute right-0">
                <img className="object-cover w-full h-screen" src="/foto_cadastro_login.png" alt="/foto_cadastro_login.png" />
                <a href="/cadastro" className="absolute top-10 left-1/2 -translate-x-1/2 text-gray-400 hover:text-white transition-all duration-300 text-xl font-semibold">
                    Cadastro
                </a>
            </section>
            <a href="/" className="absolute tb:top-7 top-9 right-10 z-20">
                <button className="nt-sm:text-gray-400 nt-sm:hover:text-white text-dark-green hover:brightness-70 transition-all duration-300 cursor-pointer">
                    <X className="tb:w-10 w-8 h-auto" />
                </button>
            </a>
        </main>
    )
}