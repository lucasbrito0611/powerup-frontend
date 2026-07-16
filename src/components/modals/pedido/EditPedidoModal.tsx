'use client'
import { useState } from "react"
import { useForm, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";

import { X } from "lucide-react"
import { Button } from "../../ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { editPedidoSchema, EditPedidoSchemaType } from "@/schemas/editPedidoSchema";
import { notify } from "@/lib/toast";
import { PedidoProps, PEDIDO_STATUS_MAP } from "@/types/pedido";
import LoadingContainer from "../../loading/LoadingContainer";
import api from "@/services/api";

interface EditPedidoModalProps {
    pedido: PedidoProps;
    onUpdate?: (updatedPedido: PedidoProps) => void;
    className?: string;
}

export default function EditPedidoModal({ pedido, onUpdate, className }: EditPedidoModalProps) {
    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EditPedidoSchemaType>({
        resolver: zodResolver(editPedidoSchema),
        mode: "onChange",
        defaultValues: {
            status: pedido.status,
        }
    });

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onSubmit = async (data: EditPedidoSchemaType) => {
        if (!isDirty) {
            notify("Altere o status antes de atualizar.", "warning");
            return;
        }

        try {
            setLoading(true);
            const response = await api.patch(`/pedidos/${pedido.id}/`, data);

            if (onUpdate) {
                onUpdate(response.data);
            }
            setOpen(false);
            notify("Status do pedido atualizado com sucesso!", "success");
        } catch (error: any) {
            if (error.response) {
                console.error("Erro na resposta da API:", error.response.data);
                const erros = error.response.data.errors || error.response.data.detail || "Erro ao atualizar status";
                notify(erros, "error");
            } else {
                console.error("Erro de rede:", error.message);
                notify("Erro de rede. Tente novamente.", "error");
            }
        } finally {
            setLoading(false);
        }
    }

    const onError = (errors: FieldErrors<EditPedidoSchemaType>) => {
        const firstError = Object.values(errors)[0];

        if (firstError && "message" in firstError) {
            notify(firstError.message as string, "warning");
        } else {
            notify("Erro ao validar dados", "warning");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={className ? undefined : "submit"} className={className}>
                    Editar
                </Button>
            </DialogTrigger>

            <DialogContent className="min-h-80 flex flex-col justify-center items-center py-10" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-2xl mb-5">Edição do Pedido <strong>#{pedido.id}</strong></DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Alterar o status do pedido selecionado</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col items-center gap-6 sm:w-4/5 w-full">
                    <LoadingContainer loading={loading}>
                        <label htmlFor="status" className="flex flex-col space-x-2 sm:text-lg w-full">
                            <strong className="mb-2">Status do Pedido:*</strong>
                            <select {...register("status")} id="status" className="input bg-white cursor-pointer h-10 px-2 rounded-sm">
                                {Object.entries(PEDIDO_STATUS_MAP).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </label>
                        {errors.status && <p className="text-red-500 mt-2">{errors.status.message}</p>}
                        
                        <div className="flex gap-8 mt-5 justify-center">
                            <Button variant="submit" size="submit" type="submit">
                                Atualizar
                            </Button>
                            <DialogClose asChild>
                                <Button variant="close" size="close" type="button" onClick={() => reset()}>
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
    )
}
