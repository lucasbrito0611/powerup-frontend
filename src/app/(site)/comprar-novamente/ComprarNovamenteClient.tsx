'use client';
import { useEffect, useState } from "react";

import PageWrapper from "@/components/layout/PageWrapper";
import ProductCard from "@/components/ProductCard";
import LoadingContainer from "@/components/loading/LoadingContainer";
import api from "@/services/api";
import withAuth from "@/lib/withAuth"; 
import { ProductProps } from "@/types/products";
import Filter from "@/components/Filter";

function ComprarNovamenteClient() {
    const [produtos, setProdutos] = useState<ProductProps[]>([]);
    const [produtosOrdenados, setProdutosOrdenados] = useState<ProductProps[]>([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/produtos/comprar_novamente/')
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
        <PageWrapper pageName="Comprar Novamente">
            <section className="space-y-10">
                <h2 className="h2 lg:hidden">Comprar Novamente</h2>
                {produtos.length > 0 && (
                    <Filter produtos={produtos} onChange={setProdutosOrdenados} />
                )}

                <LoadingContainer loading={loading}>
                    {produtosOrdenados.length > 0 ? (
                        <div className="productsContainer">
                            {produtosOrdenados.map(produto => (
                                <ProductCard
                                    key={produto.id}
                                    product={produto}
                                    onFavoriteChange={(produtoId, isFavorited) => {
                                        if (!isFavorited) {
                                            setProdutos(prev => prev.filter(p => p.id !== produtoId));
                                            setProdutosOrdenados(prev => prev.filter(p => p.id !== produtoId));
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="notFound">Nenhum produto comprado anteriormente.</p>
                    )}
                </LoadingContainer>
            </section>
        </PageWrapper>
    );
}

export default withAuth(ComprarNovamenteClient);