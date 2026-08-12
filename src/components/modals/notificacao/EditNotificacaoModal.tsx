'use client';
import { useState, useEffect } from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { useUpdate } from "@refinedev/core";
import { notify } from "@/lib/toast";
import { editNotificacaoSchema, EditNotificacaoSchemaType } from "@/schemas/editNotificacaoSchema";
import LoadingContainer from "@/components/loading/LoadingContainer";

const CATEGORIAS = [
    { value: 'status_pedido',           label: 'Status do Pedido' },
    { value: 'status_devolucao',        label: 'Status da Devolução' },
    { value: 'mensagem_personalizada',  label: 'Mensagem Geral' },
    { value: 'promocao',                label: 'Promoção' },
    { value: 'seguranca',               label: 'Segurança' },
];

interface EditNotificacaoModalProps {
    notificacao: {
        id: number;
        categoria: string;
        titulo: string;
        texto: string;
    };
    className?: string;
    onSuccess?: () => void;
}

export default function EditNotificacaoModal({ notificacao, className, onSuccess }: EditNotificacaoModalProps) {
    const [open, setOpen] = useState(false);
    const { mutate, mutation } = useUpdate();

    const { register, handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<EditNotificacaoSchemaType>({
        resolver: zodResolver(editNotificacaoSchema),
        defaultValues: {
            categoria: notificacao.categoria as any,
            titulo: notificacao.titulo,
            texto: notificacao.texto,
        },
    });

    useEffect(() => {
        reset({
            categoria: notificacao.categoria as any,
            titulo: notificacao.titulo,
            texto: notificacao.texto,
        });
    }, [notificacao, reset]);

    const onSubmit = (data: EditNotificacaoSchemaType) => {
        if (!isDirty) {
            notify("Faça alguma alteração antes de salvar.", "warning");
            return;
        }
        mutate(
            {
                resource: "notificacoes",
                id: notificacao.id,
                values: data,
                invalidates: ["all"],
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    notify("Notificação atualizada!", "success");
                    onSuccess?.();
                },
                onError: () => notify("Erro ao atualizar notificação.", "error"),
            }
        );
    };

    const onError = (errs: FieldErrors<EditNotificacaoSchemaType>) => {
        const first = Object.values(errs)[0];
        if (first && "message" in first) notify(first.message as string, "warning");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={className}>Editar</Button>
            </DialogTrigger>
            <DialogContent className="min-h-80 flex flex-col justify-center items-center py-10" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-2xl mb-5">
                        Editar Notificação <strong>#{notificacao.id}</strong>
                    </DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Editar campos da notificação</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-5 sm:w-4/5 w-full">
                    <LoadingContainer loading={mutation.isPending}>
                        <label className="flex flex-col gap-1 sm:text-base">
                            <strong>Categoria:*</strong>
                            <select {...register("categoria")} className="input">
                                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1 sm:text-base">
                            <strong>Título:*</strong>
                            <input {...register("titulo")} className="input" />
                            {errors.titulo && <p className="text-red-500 text-sm">{errors.titulo.message}</p>}
                        </label>

                        <label className="flex flex-col gap-1 sm:text-base">
                            <strong>Texto:*</strong>
                            <textarea
                                {...register("texto")}
                                placeholder="Texto da notificação"
                                className="input min-h-[100px] p-3 resize-y"
                            />
                            {errors.texto && <p className="text-red-500 text-sm">{errors.texto.message}</p>}
                        </label>


                        <div className="flex gap-8 justify-center mt-2">
                            <Button variant="submit" size="submit" type="submit">Salvar</Button>
                            <DialogClose asChild>
                                <Button variant="close" size="close" type="button" onClick={() => reset()}>Cancelar</Button>
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
