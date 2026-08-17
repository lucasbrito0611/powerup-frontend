'use client';
import { useEffect, useState } from "react";

import PageWrapper from "@/components/layout/PageWrapper";
import ProductCard from "@/components/ProductCard";
import LoadingContainer from "@/components/loading/LoadingContainer";
import api from "@/services/api";
import { ProductProps } from "@/types/products";
import Filter from "@/components/Filter";

export default function MaisVendidosClient() {
    const [produtos, setProdutos] = useState<ProductProps[]>([]);
    const [produtosOrdenados, setProdutosOrdenados] = useState<ProductProps[]>([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/produtos/mais_vendidos/')
            .then(response => {
                const lista = Array.isArray(response.data) ? response.data : (response.data?.results || []);
                setProdutos(lista);
            })
            .catch(err => console.error("Erro ao buscar histórico", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setProdutosOrdenados(produtos);
    }, [produtos]);

    return (
        <PageWrapper pageName="Mais Vendidos">
            <section className="space-y-10">
                <h2 className="h2 lg:hidden">Mais Vendidos</h2>
                {produtos.length > 0 && (
                    <Filter produtos={produtos} onChange={setProdutosOrdenados} />
                )}

                <LoadingContainer loading={loading} type="products" count={8}>
                    {produtosOrdenados.length > 0 ? (
                        <div className="productsContainer">
                            {produtosOrdenados.map(produto => (
                                <ProductCard key={produto.id} product={produto} />
                            ))}
                        </div>
                    ) : (
                        <p className="notFound">Nenhuma venda realizada.</p>
                    )}
                </LoadingContainer>
            </section>
        </PageWrapper>
    );
}