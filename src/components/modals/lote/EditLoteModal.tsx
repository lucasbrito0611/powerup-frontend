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
import { editLoteSchema, EditLoteSchemaType } from "@/schemas/editLoteSchema";
import LoadingContainer from "@/components/loading/LoadingContainer";
import { Lote } from "@/types/lote";

interface EditLoteModalProps {
    className?: string;
    onSuccess?: () => void;
    lote: Lote;
}

export default function EditLoteModal({ className, onSuccess, lote }: EditLoteModalProps) {
    const [open, setOpen] = useState(false);
    const { mutate, mutation } = useUpdate();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EditLoteSchemaType>({
        resolver: zodResolver(editLoteSchema),
        mode: "onChange",
        defaultValues: {
            quantidade: String(lote.quantidade),
            validade: lote.validade,
        },
    });

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            reset({
                quantidade: String(lote.quantidade),
                validade: lote.validade,
            });
        }
        setOpen(isOpen);
    };

    const onSubmit = (data: EditLoteSchemaType) => {
        mutate(
            {
                resource: "lotes",
                id: lote.id,
                values: {
                    quantidade: Number(data.quantidade),
                    validade: data.validade || null
                },
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    notify("Lote atualizado com sucesso!", "success");
                    onSuccess?.();
                },
                onError: (error: any) => {
                    if (error.response) {
                        const erros = error.response.data.errors || error.response.data.detail || "Erro ao atualizar lote";
                        notify(erros, "error");
                    } else {
                        notify("Erro ao atualizar lote. Tente novamente.", "error");
                    }
                },
            }
        );
    };

    const onError = (errors: FieldErrors<EditLoteSchemaType>) => {
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
                <Button variant={className ? undefined : "submit"} className={className}>
                    Editar
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:min-w-[600px]! w-full! max-w-[90dvw] max-h-[90vh] overflow-y-auto flex flex-col py-10 px-6" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-2xl mb-5">
                        Editar Lote #{lote.id}
                    </DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Edite os campos do lote</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-5 w-full">
                    <LoadingContainer loading={mutation.isPending}>

                        {/* Produto - Apenas Informativo */}
                        <div className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Produto:</strong>
                            <div className="input bg-gray-100 text-gray-600 h-10 px-3 flex items-center border border-gray-200 rounded-sm cursor-not-allowed select-none">
                                <span>{lote.produto_nome}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">O produto do lote não pode ser alterado.</p>
                        </div>

                        {/* Quantidade */}
                        <label htmlFor="editar-quantidade" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Quantidade:*</strong>
                            <input
                                {...register("quantidade")}
                                id="editar-quantidade"
                                type="number"
                                className="input bg-white h-10 px-3 rounded-sm"
                                placeholder="Quantidade de itens no lote"
                            />
                            {errors.quantidade && <p className="text-red-500 text-sm mt-1">{errors.quantidade.message}</p>}
                        </label>

                        {/* Validade */}
                        <label htmlFor="editar-validade" className="flex flex-col gap-1 sm:text-base w-full">
                            <strong>Data de Validade:*</strong>
                            <input
                                {...register("validade")}
                                id="editar-validade"
                                type="date"
                                className="input bg-white h-10 px-3 rounded-sm"
                            />
                            {errors.validade && <p className="text-red-500 text-sm mt-1">{errors.validade.message}</p>}
                        </label>

                        <div className="flex gap-8 mt-3 justify-center">
                            <Button variant="submit" size="submit" type="submit">
                                Salvar Alterações
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
