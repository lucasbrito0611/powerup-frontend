'use client';
import { useEffect, useState, useMemo } from "react";

import api from "@/services/api";
import ProductCard from "@/components/ProductCard";
import PageWrapper from "@/components/layout/PageWrapper";
import LoadingContainer from "@/components/loading/LoadingContainer";
import Filter from "@/components/Filter";
import withAuth from "@/lib/withAuth";
import { ProductProps } from "@/types/products";

function FavoritosClient() {
    const [produtos, setProdutos] = useState<ProductProps[]>([]); 
    const [produtosOrdenados, setProdutosOrdenados] = useState<ProductProps[]>([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/favoritos/")
            .then(res => {
                const lista = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setProdutos(lista);
            })
            .catch(err => console.error("Erro ao carregar favoritos:", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setProdutosOrdenados(produtos);
    }, [produtos]);

    return (
        <PageWrapper pageName="Meus Favoritos">
            <section className="space-y-10">
                <h2 className="h2 lg:hidden">Meus Favoritos</h2>
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
                        <p className="notFound">Nenhum produto favoritado.</p>
                    )}
                </LoadingContainer>
            </section>
        </PageWrapper>
    );
}

export default withAuth(FavoritosClient);