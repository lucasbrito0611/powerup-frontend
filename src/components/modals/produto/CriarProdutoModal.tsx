'use client';
import { useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus } from "lucide-react";
import { useCreate } from "@refinedev/core";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { notify } from "@/lib/toast";
import { CATEGORIA_MAP } from "@/types/products";
import { criarProdutoSchema, CriarProdutoSchemaType } from "@/schemas/criarProdutoSchema";
import LoadingContainer from "@/components/loading/LoadingContainer";

interface CriarProdutoModalProps {
    className?: string;
    onSuccess?: () => void;
}

export default function CriarProdutoModal({ className, onSuccess }: CriarProdutoModalProps) {
    const [open, setOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { mutate, mutation } = useCreate();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CriarProdutoSchemaType>({
        resolver: zodResolver(criarProdutoSchema),
        mode: "onChange",
        defaultValues: {
            porcentagem_desconto: "0",
            categoria: "suplementos",
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            reset({
                nome: "",
                descricao: "",
                preco: "",
                porcentagem_desconto: "0",
                categoria: "suplementos",
            });
            setPreviewUrl(null);
        }
        setOpen(isOpen);
    };

    const onSubmit = (data: CriarProdutoSchemaType) => {
        const formData = new FormData();
        formData.append("nome", data.nome);
        formData.append("descricao", data.descricao);
        formData.append("preco", String(Number(data.preco.replace(",", "."))));
        formData.append("porcentagem_desconto", String(Number(data.porcentagem_desconto)));
        formData.append("categoria", data.categoria);
        formData.append("imagem_upload", data.imagem[0]);

        mutate(
            {
                resource: "produtos",
                values: formData,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setPreviewUrl(null);
                    notify("Produto criado com sucesso!", "success");
                    onSuccess?.();
                },
                onError: (error: any) => {
                    if (error.response) {
                        console.error("Erro na resposta da API:", error.response.data);
                        const erros = error.response.data.errors || error.response.data.detail || "Erro ao criar produto";
                        notify(erros, "error");
                    } else {
                        console.error("Erro:", error.message || error);
                        notify("Erro ao criar produto. Tente novamente.", "error");
                    }
                },
            }
        );
    };

    const onError = (errors: FieldErrors<CriarProdutoSchemaType>) => {
        const firstError = Object.values(errors)[0];
        if (firstError && "message" in firstError) {
            notify(firstError.message as string, "warning");
        } else {
            notify("Erro ao validar dados", "warning");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button variant="submit" size="submit" className={className}>
                    <Plus className="w-4 h-4" />
                    Novo Produto
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:min-w-[600px]! w-full! max-w-[90dvw] max-h-[90vh] overflow-y-auto flex flex-col py-10 px-6" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-2xl mb-5">
                        Criar Novo Produto
                    </DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Preencha os campos para adicionar um novo produto ao catálogo</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-5 w-full">
                    <LoadingContainer loading={mutation.isPending}>

                        {/* Nome */}
                        <label htmlFor="criar-nome" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Nome:*</strong>
                            <input
                                {...register("nome")}
                                id="criar-nome"
                                type="text"
                                className="input bg-white h-10 px-3"
                                placeholder="Nome do produto"
                            />
                            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
                        </label>

                        {/* Descrição */}
                        <label htmlFor="criar-descricao" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Descrição:*</strong>
                            <textarea
                                {...register("descricao")}
                                id="criar-descricao"
                                rows={4}
                                className="input bg-white px-3 py-2 rounded-sm resize-none"
                                placeholder="Descrição detalhada do produto"
                            />
                            {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao.message}</p>}
                        </label>

                        {/* Preço e Desconto lado a lado */}
                        <div className="flex gap-4">
                            <label htmlFor="criar-preco" className="flex flex-col gap-1 sm:text-base flex-1">
                                <strong>Preço (R$):*</strong>
                                <input
                                    {...register("preco")}
                                    id="criar-preco"
                                    type="text"
                                    className="input bg-white h-10 px-3 rounded-sm"
                                    placeholder="Ex: 99.90"
                                />
                                {errors.preco && <p className="text-red-500 text-sm mt-1">{errors.preco.message}</p>}
                            </label>

                            <label htmlFor="criar-porcentagem_desconto" className="flex flex-col gap-1 sm:text-base flex-1">
                                <strong>Desconto (%):</strong>
                                <input
                                    {...register("porcentagem_desconto")}
                                    id="criar-porcentagem_desconto"
                                    type="number"
                                    min={0}
                                    max={100}
                                    className="input bg-white h-10 px-3 rounded-sm"
                                    placeholder="0"
                                />
                                {errors.porcentagem_desconto && <p className="text-red-500 text-sm mt-1">{errors.porcentagem_desconto.message}</p>}
                            </label>
                        </div>

                        {/* Categoria */}
                        <label htmlFor="criar-categoria" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Categoria:*</strong>
                            <select
                                {...register("categoria")}
                                id="criar-categoria"
                                className="input bg-white cursor-pointer h-10 px-2 rounded-sm"
                            >
                                {Object.entries(CATEGORIA_MAP).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            {errors.categoria && <p className="text-red-500 text-sm mt-1">{errors.categoria.message}</p>}
                        </label>

                        {/* Imagem */}
                        <label htmlFor="criar-imagem" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Imagem:*</strong>
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                {previewUrl && (
                                    <img
                                        src={previewUrl}
                                        alt="Preview do produto"
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                    />
                                )}
                                <div className="flex flex-col gap-1 flex-1">
                                    <input
                                        {...register("imagem")}
                                        id="criar-imagem"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => {
                                            register("imagem").onChange(e);
                                            handleImageChange(e);
                                        }}
                                        className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-400">Dimensão recomendada: 220x220. Máx.: 3 GB.</p>
                                </div>
                            </div>
                            {errors.imagem && <p className="text-red-500 text-sm mt-1">{errors.imagem.message as string}</p>}
                        </label>

                        <div className="flex gap-8 mt-3 justify-center">
                            <Button variant="submit" size="submit" type="submit">
                                Criar Produto
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
