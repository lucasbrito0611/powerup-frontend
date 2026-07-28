'use client';

import { useState, useRef, useEffect } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Search } from "lucide-react";
import { useCreate, useList } from "@refinedev/core";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { notify } from "@/lib/toast";
import { criarLoteSchema, CriarLoteSchemaType } from "@/schemas/criarLoteSchema";
import LoadingContainer from "@/components/loading/LoadingContainer";
import { ProductProps } from "@/types/products";

interface CriarLoteModalProps {
    className?: string;
    onSuccess?: () => void;
}

export default function CriarLoteModal({ className, onSuccess }: CriarLoteModalProps) {
    const [open, setOpen] = useState(false);
    const { mutate, mutation } = useCreate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { query: produtosQuery } = useList<ProductProps>({
        resource: "produtos",
        pagination: { pageSize: 1000 },
    });
    
    const produtos = produtosQuery.data?.data ?? [];
    const isLoadingProdutos = produtosQuery.isLoading;
    
    const produtosFiltrados = produtos.filter((p: ProductProps) => 
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CriarLoteSchemaType>({
        resolver: zodResolver(criarLoteSchema),
        mode: "onChange",
        defaultValues: {
            produto: "",
            quantidade: "",
            validade: "",
        },
    });

    const produtoSelecionado = watch("produto");

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            reset();
            setSearchTerm('');
            setIsDropdownOpen(false);
        }
        setOpen(isOpen);
    };

    const onSubmit = (data: CriarLoteSchemaType) => {
        mutate(
            {
                resource: "lotes",
                values: {
                    produto: Number(data.produto),
                    quantidade: Number(data.quantidade),
                    validade: data.validade || null
                },
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    notify("Lote criado com sucesso!", "success");
                    onSuccess?.();
                },
                onError: (error: any) => {
                    if (error.response) {
                        const erros = error.response.data.errors || error.response.data.detail || "Erro ao criar lote";
                        notify(erros, "error");
                    } else {
                        notify("Erro ao criar lote. Tente novamente.", "error");
                    }
                },
            }
        );
    };

    const onError = (errors: FieldErrors<CriarLoteSchemaType>) => {
        const firstError = Object.values(errors)[0];
        if (firstError && "message" in firstError) {
            notify(firstError.message as string, "warning");
        } else {
            notify("Erro ao validar dados", "warning");
        }
    };

    const selectedProductName = produtos.find((p: ProductProps) => p.id === Number(produtoSelecionado))?.nome || "Selecione um produto...";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button variant="submit" size="submit" className={className}>
                    <Plus className="w-4 h-4" />
                    Novo Lote
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:min-w-[600px]! w-full! max-w-[90dvw] max-h-[90vh] overflow-y-auto flex flex-col py-10 px-6" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-2xl mb-5">
                        Criar Novo Lote
                    </DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Preencha os campos para adicionar um novo lote</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-5 w-full">
                    <LoadingContainer loading={mutation.isPending}>

                        {/* Produto - Custom Searchable Select */}
                        <div className="flex flex-col gap-1 sm:text-base w-full relative" ref={dropdownRef}>
                            <strong>Produto:*</strong>
                            <div 
                                className="input bg-white h-10 px-3 flex items-center justify-between cursor-pointer"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className={produtoSelecionado ? "text-gray-800" : "text-gray-400"}>
                                    {selectedProductName}
                                </span>
                            </div>
                            
                            {isDropdownOpen && (
                                <div className="absolute top-[70px] left-0 w-full bg-white border border-gray-200 shadow-lg z-50 rounded-sm max-h-60 flex flex-col">
                                    <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                                        <Search className="w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text"
                                            placeholder="Pesquisar produto..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full outline-none text-sm"
                                        />
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                        {isLoadingProdutos ? (
                                            <div className="p-3 text-sm text-gray-500 text-center">Carregando produtos...</div>
                                        ) : produtosFiltrados.length === 0 ? (
                                            <div className="p-3 text-sm text-gray-500 text-center">Nenhum produto encontrado.</div>
                                        ) : (
                                            produtosFiltrados.map((produto: ProductProps) => (
                                                <div 
                                                    key={produto.id}
                                                    className="p-2 px-3 text-sm hover:bg-gray-100 cursor-pointer text-gray-800"
                                                    onClick={() => {
                                                        setValue("produto", String(produto.id), { shouldValidate: true });
                                                        setSearchTerm("");
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    {produto.nome}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                            <input type="hidden" {...register("produto")} />
                            {errors.produto && <p className="text-red-500 text-sm mt-1">{errors.produto.message}</p>}
                        </div>

                        {/* Quantidade */}
                        <label htmlFor="criar-quantidade" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Quantidade:*</strong>
                            <input
                                {...register("quantidade")}
                                id="criar-quantidade"
                                type="number"
                                className="input bg-white h-10 px-3 rounded-sm"
                                placeholder="Quantidade de itens no lote"
                            />
                            {errors.quantidade && <p className="text-red-500 text-sm mt-1">{errors.quantidade.message}</p>}
                        </label>

                        {/* Validade */}
                        <label htmlFor="criar-validade" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Data de Validade:*</strong>
                            <input
                                {...register("validade")}
                                id="criar-validade"
                                type="date"
                                className="input bg-white h-10 px-3 rounded-sm"
                            />
                            {errors.validade && <p className="text-red-500 text-sm mt-1">{errors.validade.message}</p>}
                        </label>

                        <div className="flex gap-8 mt-3 justify-center">
                            <Button variant="submit" size="submit" type="submit">
                                Criar Lote
                            </Button>
                            <DialogClose asChild>
                                <Button variant="close" size="close" type="button" onClick={() => handleClose(false)}>
                                    Cancelar
                                </Button>
                            </DialogClose>
                        </div>

                    </LoadingContainer>
                </form>

                <DialogClose asChild>
                    <button className="absolute p-0.5 right-4 top-4 border-none rounded-sm text-black hover:bg-gray-200 transition-color-slow cursor-pointer focus:outline-none">
                        <X className="w-7 h-auto" />
                    </button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
