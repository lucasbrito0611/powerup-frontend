'use client';
import { useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useUpdate } from "@refinedev/core";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { notify } from "@/lib/toast";
import { ProductProps, CATEGORIA_MAP } from "@/types/products";
import { editProdutoSchema, EditProdutoSchemaType } from "@/schemas/editProdutoSchema";
import LoadingContainer from "@/components/loading/LoadingContainer";

interface EditProdutoModalProps {
    produto: ProductProps;
    className?: string;
}

export default function EditProdutoModal({ produto, className }: EditProdutoModalProps) {
    const [open, setOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { mutate, mutation } = useUpdate();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EditProdutoSchemaType>({
        resolver: zodResolver(editProdutoSchema),
        mode: "onChange",
        defaultValues: {
            nome: produto.nome,
            preco: String(produto.preco),
            porcentagem_desconto: String(produto.porcentagem_desconto ?? 0),
            categoria: produto.categoria,
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            reset({
                nome: produto.nome,
                preco: String(produto.preco),
                porcentagem_desconto: String(produto.porcentagem_desconto ?? 0),
                categoria: produto.categoria,
            });
            setPreviewUrl(null);
        }
        setOpen(isOpen);
    };

    const onSubmit = (data: EditProdutoSchemaType) => {
        const formData = new FormData();
        formData.append("nome", data.nome);
        formData.append("preco", String(Number(data.preco.replace(",", "."))));
        formData.append("porcentagem_desconto", String(Number(data.porcentagem_desconto)));
        formData.append("categoria", data.categoria);

        if (data.imagem && data.imagem.length > 0) {
            formData.append("imagem_upload", data.imagem[0]);
        }

        mutate(
            {
                resource: "produtos",
                id: produto.id,
                values: formData,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setPreviewUrl(null);
                    notify("Produto atualizado com sucesso!", "success");
                },
                onError: (error: any) => {
                    if (error.response) {
                        console.error("Erro na resposta da API:", error.response.data);
                        const erros = error.response.data.errors || error.response.data.detail || "Erro ao atualizar produto";
                        notify(erros, "error");
                    } else {
                        console.error("Erro:", error.message || error);
                        notify("Erro ao atualizar produto. Tente novamente.", "error");
                    }
                },
            }
        );
    };

    const onError = (errors: FieldErrors<EditProdutoSchemaType>) => {
        const firstError = Object.values(errors)[0];
        if (firstError && "message" in firstError) {
            notify(firstError.message as string, "warning");
        } else {
            notify("Erro ao validar dados", "warning");
        }
    };

    const imagemAtual = previewUrl ?? produto.imagem;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button variant={className ? undefined : "submit"} className={className}>
                    Editar
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:min-w-[600px]! w-full! max-w-[90dvw] max-h-[90vh] overflow-y-auto flex flex-col py-10 px-6" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-2xl mb-5">
                        Edição do Produto <strong>#{produto.id}</strong>
                    </DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Alterar informações do produto selecionado</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-5 w-full">
                    <LoadingContainer loading={mutation.isPending}>

                        {/* Nome */}
                        <label htmlFor="nome" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Nome:*</strong>
                            <input
                                {...register("nome")}
                                id="nome"
                                type="text"
                                className="input bg-white h-10 px-3 rounded-sm"
                                placeholder="Nome do produto"
                            />
                            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
                        </label>

                        {/* Preço e Desconto lado a lado */}
                        <div className="flex gap-4">
                            <label htmlFor="preco" className="flex flex-col gap-1 sm:text-base flex-1">
                                <strong>Preço (R$):*</strong>
                                <input
                                    {...register("preco")}
                                    id="preco"
                                    type="text"
                                    className="input bg-white h-10 px-3 rounded-sm"
                                    placeholder="Ex: 99.90"
                                />
                                {errors.preco && <p className="text-red-500 text-sm mt-1">{errors.preco.message}</p>}
                            </label>

                            <label htmlFor="porcentagem_desconto" className="flex flex-col gap-1 sm:text-base flex-1">
                                <strong>Desconto (%):*</strong>
                                <input
                                    {...register("porcentagem_desconto")}
                                    id="porcentagem_desconto"
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
                        <label htmlFor="categoria" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Categoria:*</strong>
                            <select
                                {...register("categoria")}
                                id="categoria"
                                className="input bg-white cursor-pointer h-10 px-2 rounded-sm"
                            >
                                {Object.entries(CATEGORIA_MAP).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            {errors.categoria && <p className="text-red-500 text-sm mt-1">{errors.categoria.message}</p>}
                        </label>

                        {/* Imagem */}
                        <label htmlFor="imagem" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Imagem:</strong>
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                {imagemAtual && (
                                    <img
                                        src={imagemAtual}
                                        alt="Preview do produto"
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                    />
                                )}
                                <div className="flex flex-col gap-1 flex-1">
                                    <input
                                        {...register("imagem")}
                                        id="imagem"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => {
                                            register("imagem").onChange(e);
                                            handleImageChange(e);
                                        }}
                                        className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-400">JPG, PNG ou WEBP · máx. 5MB · Deixe vazio para manter a imagem atual.</p>
                                </div>
                            </div>
                            {errors.imagem && <p className="text-red-500 text-sm mt-1">{errors.imagem.message as string}</p>}
                        </label>

                        <div className="flex gap-8 mt-3 justify-center">
                            <Button variant="submit" size="submit" type="submit">
                                Atualizar
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
