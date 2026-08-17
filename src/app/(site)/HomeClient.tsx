'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { FaMagnifyingGlass, FaBottleWater, FaShirt } from "react-icons/fa6";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { GiKnifeFork } from "react-icons/gi";
import { FaChevronDown } from "react-icons/fa";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Category from "@/components/Category";
import ProductCard from "@/components/ProductCard";
import { ProductProps } from '@/types/products';
import PageWrapper from '@/components/layout/PageWrapper';
import LoadingContainer from '@/components/loading/LoadingContainer';
import api from '@/services/api';

export default function HomeClient() {
    const [promocoes, setPromocoes] = useState<ProductProps[]>([]);
    const [maisVendidos, setMaisVendidos] = useState<ProductProps[]>([]);
    const [loadingHome, setLoadingHome] = useState(true);

    const [pesquisarProduto, setPesquisarProduto] = useState('');
    const [resultado, setResultado] = useState<ProductProps[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoadingHome(true);

        Promise.all([
            api.get('/promocoes/?limit=5').catch(() => ({ data: [] })),
            api.get('/produtos/mais_vendidos/?limit=5').catch(() => ({ data: [] })),
        ])
            .then(([promocoesRes, maisVendidosRes]) => {
                if (!isMounted) return;

                const listaPromocoes = Array.isArray(promocoesRes.data)
                    ? promocoesRes.data
                    : (promocoesRes.data?.results || []);

                const listaMaisVendidos = Array.isArray(maisVendidosRes.data)
                    ? maisVendidosRes.data
                    : (maisVendidosRes.data?.results || []);

                setPromocoes(listaPromocoes.slice(0, 5));
                setMaisVendidos(listaMaisVendidos.slice(0, 5));
            })
            .catch(err => {
                console.error("Erro ao carregar dados da Home:", err);
            })
            .finally(() => {
                if (isMounted) setLoadingHome(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        const pesquisa = pesquisarProduto.trim();

        if (pesquisa === '') {
            setShowResults(false);
            setResultado([]);
            return;
        }

        setLoadingSearch(true);
        setShowResults(true);

        try {
            const response = await api.get(`/produtos/?search=${encodeURIComponent(pesquisa)}`);
            const lista = Array.isArray(response.data)
                ? response.data
                : (response.data?.results || []);
            setResultado(lista);
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
            setResultado([]);
        } finally {
            setLoadingSearch(false);
        }
    };

    useEffect(() => {
        if (pesquisarProduto.trim() === '') {
            setShowResults(false);
            setResultado([]);
        }
    }, [pesquisarProduto]);

    return (
        <PageWrapper pageName='Página Inicial'>
            <section>
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Encontre o seu produto"
                            value={pesquisarProduto}
                            onChange={(e) => setPesquisarProduto(e.target.value)}
                            className="bg-dark-grey text-white text-sm mb-lg:text-base w-full mb-lg:px-15 px-12 py-3 outline-none rounded-lg"
                        />
                        <button
                            type="submit"
                            className="cursor-pointer absolute left-0 mb-lg:top-[25%] top-[28%] ml-3 text-light-green mb-lg:text-2xl text-xl"
                        >
                            <FaMagnifyingGlass />
                        </button>
                    </div>
                </form>
            </section>

            {showResults ? (
                // SEÇÃO DO RESULTADO DA PESQUISA 
                <section className="space-y-8 mt-2">
                    <p className='text-dark-grey text-xl font-medium'>Produtos encontrados: {resultado.length}</p>
                    <LoadingContainer loading={loadingSearch} type="products" count={4}>
                        {resultado.length > 0 ? (
                            <div className="productsContainer">
                                {resultado.map(produto => (
                                    <ProductCard key={produto.id} product={produto} />
                                ))}
                            </div>
                        ) : (
                            <p className="notFound">Nenhum produto encontrado.</p>
                        )}
                    </LoadingContainer>
                </section>
            ) : (
                // SEÇÃO DA HOME 
                <>
                    <section className="slides">
                        <Carousel>
                            <CarouselContent>
                                {['imagem1', 'imagem2', 'imagem3', 'imagem4'].map((img, index) => (
                                    <CarouselItem key={index}>
                                        <Image
                                            src={`/carrossel/${img}_carrossel.png`}
                                            alt={`Imagem ${index + 1}`}
                                            width={1300}
                                            height={550}
                                            className="object-cover nt-sm:rounded-[30px] mb:rounded-[15px] rounded-[10px]"
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    </section>

                    <div className="space-y-20">
                        <section className="space-y-8">
                            <h2 className="h2">Categorias</h2>
                            <div className="flex justify-between items-center flex-wrap gap-y-5">
                                <Category href="acessorios" icon={<FaBottleWater className="text-light-green text-3xl md:text-4xl" />} name="Acessórios" isEven />
                                <Category href="alimentos" icon={<GiKnifeFork className="text-black text-3xl md:text-4xl" />} name="Alimentos" />
                                <Category href="roupas" icon={<FaShirt className="text-light-green text-3xl md:text-4xl" />} name="Roupas" isEven />
                                <Category href="suplementos" icon={<BsFillLightningChargeFill className="text-black text-3xl md:text-4xl" />} name="Suplementos" />
                            </div>
                        </section>

                        {(loadingHome || promocoes.length > 0) && (
                            <section className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="h2">Ofertas Especiais</h2>
                                    <Link href="/promocoes" className="group flex items-center gap-2">
                                        <p className="font-bold tb:text-lg">Ver mais</p>
                                        <FaChevronDown className="text-green text-lg mb-lg:text-xl rotate-180-smooth" />
                                    </Link>
                                </div>
                                <LoadingContainer loading={loadingHome} type="products" count={5}>
                                    <div className="productsContainer">
                                        {promocoes.map(produto =>
                                            <ProductCard key={produto.id} product={produto} />
                                        )}
                                    </div>
                                </LoadingContainer>
                            </section>
                        )}

                        <section className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h2 className="h2">Mais Vendidos</h2>
                                <Link href="/mais-vendidos" className="group flex items-center gap-2">
                                    <p className="font-bold tb:text-lg">Ver mais</p>
                                    <FaChevronDown className="text-green text-lg mb-lg:text-xl rotate-180-smooth" />
                                </Link>
                            </div>
                            <LoadingContainer loading={loadingHome} type="products" count={5}>
                                {maisVendidos.length > 0 ? (
                                    <div className="productsContainer">
                                        {maisVendidos.map(produto => (
                                            <ProductCard key={produto.id} product={produto} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="notFound">Nenhum produto encontrado.</p>
                                )}
                            </LoadingContainer>
                        </section>
                    </div>
                </>
            )}
        </PageWrapper>
    );
}
