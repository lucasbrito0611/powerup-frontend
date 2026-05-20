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
                setProdutos(response.data);
            })
            .catch(err => console.error("Erro ao buscar histórico", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setProdutosOrdenados(produtos);
    }, [produtos]);

    return (
        <PageWrapper pageName="Comprar Novamente">
            {produtos.length > 0 ? (
                <>
                    <h2 className="h2 lg:hidden">Meus Favoritos</h2>
                    <Filter produtos={produtos} onChange={setProdutosOrdenados} />

                    <LoadingContainer loading={loading}>
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
                    </LoadingContainer>
                </>
            ) : (
                <p className="notFound">Nenhum produto favoritado.</p>
            )}
        </PageWrapper>
    );
}

export default withAuth(ComprarNovamenteClient);