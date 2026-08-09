'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { NotificacaoContextData } from '@/types/notificacao';
import api from '@/services/api';

const NotificacaoContext = createContext({} as NotificacaoContextData);

export function NotificacaoProvider({ children }: { children: ReactNode }) {
    const [count, setCount] = useState(0);
    const { isLogged } = useAuth();

    const atualizarContador = useCallback(async () => {
        if (!isLogged) return;
        try {
            const response = await api.get('/notificacoes/nao_lidas_count/');
            setCount(response.data.count);
        } catch (err) {
            console.error(err);
        }
    }, [isLogged]);

    useEffect(() => {
        if (!isLogged) {
            setCount(0);
            return;
        }

        atualizarContador();

        // 1. Polling rápido a cada 10 segundos
        const interval = setInterval(atualizarContador, 10000);

        // 2. Atualizar imediatamente quando a aba/janela receber foco
        const handleFocusOrVisibility = () => {
            if (document.visibilityState === 'visible') {
                atualizarContador();
            }
        };

        window.addEventListener('visibilitychange', handleFocusOrVisibility);
        window.addEventListener('focus', handleFocusOrVisibility);

        return () => {
            clearInterval(interval);
            window.removeEventListener('visibilitychange', handleFocusOrVisibility);
            window.removeEventListener('focus', handleFocusOrVisibility);
        };
    }, [isLogged, atualizarContador]);

    return (
        <NotificacaoContext.Provider value={{ count, atualizarContador }}>
            {children}
        </NotificacaoContext.Provider>
    );
}

export const useNotificacao = () => useContext(NotificacaoContext);