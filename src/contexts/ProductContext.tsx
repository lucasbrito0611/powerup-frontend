'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/services/api';
import { ProductProps, ProductContextType } from '../types/products';

const ProdutosContext = createContext<ProductContextType | undefined>(undefined);

export function ProdutosProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/produtos/?page_size=9999')
      .then(response => {
        const data = response.data;
        setProdutos(Array.isArray(data) ? data : (data.results ?? []));
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao buscar produtos:', err);
        setLoading(false);
      });
  }, []);

  return (
    <ProdutosContext.Provider value={{ produtos, setProdutos, loading }}>
      {children}
    </ProdutosContext.Provider>
  );
}

export function useProdutos() {
  const context = useContext(ProdutosContext);
  if (!context) throw new Error('useProdutos deve ser usado dentro de ProdutosProvider');
  return context;
}
