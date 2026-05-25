'use client';

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useMenu } from "./MenuContext";

import { notify } from '@/lib/toast';
import { User, AuthContextType } from '@/types/auth';
import api from '@/services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const { setMenuOpen } = useMenu();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await api.get('/me/');
                setUser(response.data);
            } catch {
                // 401 = sem sessão ativa, estado correto (não é erro)
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async (showMessage = true) => {
        setIsLoggingOut(true);
        setUser(null);
        localStorage.removeItem('user');

        try {
            await api.post('/logout/');
        } catch {
            // Mesmo que a chamada falhe, limpamos o estado local
        }

        if (showMessage) {
            notify("Você saiu da sua conta com sucesso.", "success");
        }

        setMenuOpen(false);
        router.replace('/');
    };

    return (
        <AuthContext.Provider value={{ isLogged: !!user, user, setUser, login, logout, loading, isLoggingOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};