'use client';

import { useState } from "react";
import { X } from "lucide-react";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { ProductProps, CATEGORIA_MAP } from "@/types/products";
import { formatCurrency } from "@/lib/utils";

interface AdminDetalhesProdutoModalProps {
    produto: ProductProps;
    className?: string;
}

export default function AdminDetalhesProdutoModal({ produto, className }: AdminDetalhesProdutoModalProps) {
    const [open, setOpen] = useState(false);

    const temDesconto = produto.porcentagem_desconto > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={className ?? "max-xl:w-full bg-blue-700 hover:bg-blue-800 text-white text-base cursor-pointer"}>
                    Detalhes
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:min-w-[700px]! w-full! max-w-[90dvw] max-h-[90vh] overflow-y-auto flex flex-col p-6 rounded-xl" aria-describedby={undefined}>
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-bold">Detalhes do produto #{produto.id}</DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Informações completas do produto {produto.nome}</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <div className="flex flex-col gap-6">

                    {/* Imagem + Infos principais */}
                    <div className="flex flex-col sm:flex-row gap-6">

                        {/* Imagem */}
                        <div className="flex-shrink-0 sm:w-48 w-full">
                            {produto.imagem ? (
                                <div className="relative w-3/5 sm:w-48 max-sm:mx-auto aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={produto.imagem}
                                        alt={`Imagem do produto ${produto.nome}`}
                                        className="w-full h-full object-cover object-center"
                                    />
                                </div>
                            ) : (
                                <div className="w-full sm:w-48 h-48 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                    Sem imagem
                                </div>
                            )}
                        </div>

                        {/* Dados principais */}
                        <div className="flex flex-col gap-3 text-base flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{produto.nome}</h3>

                            <p>
                                <strong className="font-bold text-gray-800">Categoria: </strong>
                                <span className="font-medium">{CATEGORIA_MAP[produto.categoria] ?? produto.categoria}</span>
                            </p>

                            <p>
                                <strong className="font-bold text-gray-800">Preço original: </strong>
                                <span className={`font-medium ${temDesconto ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {formatCurrency(produto.preco)}
                                </span>
                            </p>

                            {temDesconto && (
                                <>
                                    <p>
                                        <strong className="font-bold text-gray-800">Desconto: </strong>
                                        <span className="inline-block bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full text-sm">
                                            {produto.porcentagem_desconto}% OFF
                                        </span>
                                    </p>
                                    <p>
                                        <strong className="font-bold text-gray-800">Preço com desconto: </strong>
                                        <span className="font-bold text-green-700 text-lg">
                                            {formatCurrency(produto.preco_calculado)}
                                        </span>
                                    </p>
                                </>
                            )}

                            <p>
                                <strong className="font-bold text-gray-800">Estoque disponível: </strong>
                                <span className={`font-semibold ${(produto.estoque ?? 0) > 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                    {produto.estoque ?? 0} unidade(s)
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <h4 className="text-lg font-bold text-gray-800">Descrição</h4>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {produto.descricao || <span className="italic text-gray-400">Sem descrição.</span>}
                        </p>
                    </div>

                </div>

                <DialogClose asChild>
                    <button className="absolute p-0.5 right-4 top-4 border-none rounded-sm text-black hover:bg-gray-200 transition-color-slow cursor-pointer focus:outline-none">
                        <X className="w-7 h-auto" />
                    </button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
