"use client";

import { AuthProvider } from "@refinedev/core";
import { LoginSchemaType } from "@/schemas/loginSchema";
import api from "@/services/api";

export const authProvider: AuthProvider = {
  login: async ({ email, senha }: LoginSchemaType) => {
    try {
      await api.post("/login/", { email, senha });
      return {
        success: true,
        redirectTo: "/admin",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "Erro de Login",
          message: "Credenciais inválidas",
        },
      };
    }
  },
  logout: async () => {
    try {
      await api.post("/logout/");
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
    return {
      success: true,
      redirectTo: "/", 
    };
  },
  check: async () => {
    try {
      await api.get("/me/");
      return {
        authenticated: true,
      };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/",
      };
    }
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    try {
      const { data } = await api.get("/me/");
      return data;
    } catch (error) {
      return null;
    }
  },
  onError: async (error: any) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }
    return { error };
  },
};
