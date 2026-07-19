'use client'
import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { RiAlertFill } from "react-icons/ri";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "../ui/button"
import { notify } from "@/lib/toast";
import api from "@/services/api";
import { ExcluirLoteModalProps } from "@/types/lote";

export default function ExcluirLoteModal({ loteId, loteIds, onRefresh, onSuccess }: ExcluirLoteModalProps) {

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // Determina se está em modo massa ou individual
    const isBulk = loteIds !== undefined && loteIds.length > 0;
    const bulkCount = loteIds?.length ?? 0;

    const handleDelete = async () => {
        setLoading(true);
        try {
            if (isBulk) {
                // --- Modo em massa ---
                await api.post('/lotes/bulk_delete/', { ids: loteIds });
                notify(
                    bulkCount === 1
                        ? "1 lote excluído com sucesso!"
                        : `${bulkCount} lotes excluídos com sucesso!`,
                    "success"
                );
                onSuccess?.();
            } else {
                // --- Modo individual ---
                await api.delete(`/lotes/${loteId}/`);
                notify("Lote excluído com sucesso!", "success");
            }

            setOpen(false);

            onRefresh?.();
        } catch (error) {
            console.error("Erro ao excluir lote(s):", error);
            notify("Erro ao excluir. Tente novamente.", "error");
        } finally {
            setLoading(false);
        }
    };

    const title = isBulk ? "Exclusão em Massa" : "Exclusão de Lote";
    const description = isBulk
        ? `Deseja realmente excluir ${bulkCount === 1 ? "1 lote" : `${bulkCount} lotes`}?`
        : "Deseja realmente excluir esse lote?";
    const confirmLabel = loading
        ? "Excluindo..."
        : isBulk
            ? `Excluir ${bulkCount === 1 ? "1 lote" : `${bulkCount} lotes`}`
            : "Excluir";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="exclude"
                    size="sm"
                    className="max-sm:text-sm! gap-2"
                >
                    <Trash2 size={16} />
                    {isBulk ? `Excluir (${bulkCount})` : "Excluir"}
                </Button>
            </DialogTrigger>

            <DialogContent className="w-180 flex flex-col justify-center items-center" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-2xl mb-5 text-center">
                        {title}
                    </DialogTitle>
                    <VisuallyHidden>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>Confirmar exclusão do(s) lote(s).</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>
                <div className="flex flex-col items-center gap-5 px-10 text-center tb:text-xl text-lg font-semibold">
                    <div>
                        <p>{description}</p>
                        <strong>Essa é uma ação permanente.</strong>
                    </div>
                    <RiAlertFill size={60} />
                    <div className="flex gap-8">
                        <DialogClose asChild>
                            <Button variant="close" size="close" type="button">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            variant="submit"
                            size="submit"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
                <DialogClose asChild>
                    <button className="absolute p-0.5 right-4 top-4 border-none rounded-sm text-black hover:bg-gray-200 transition-color-slow cursor-pointer focus:outline-none">
                        <X className="w-7 h-auto" />
                    </button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}