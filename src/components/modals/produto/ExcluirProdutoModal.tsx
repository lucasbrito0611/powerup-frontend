'use client';
import { useState } from "react";
import { X } from "lucide-react";
import { RiAlertFill } from "react-icons/ri";
import { useDelete } from "@refinedev/core";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/toast";

interface ExcluirProdutoModalProps {
    produtoId: number;
    nomeProduto: string;
    className?: string;
}

export default function ExcluirProdutoModal({ produtoId, nomeProduto, className }: ExcluirProdutoModalProps) {
    const [open, setOpen] = useState(false);
    const { mutate, mutation } = useDelete();

    const handleDelete = () => {
        mutate(
            {
                resource: "produtos",
                id: produtoId,
            },
            {
                onSuccess: () => {
                    notify("Produto excluído com sucesso!", "success");
                    setOpen(false);
                },
                onError: (error) => {
                    console.error("Erro ao excluir:", error);
                    notify("Erro ao excluir produto. Tente novamente.", "error");
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={className || "w-full bg-[#FF360A] hover:bg-[#CC2D08] text-white text-base cursor-pointer"}>
                    Excluir
                </Button>
            </DialogTrigger>

            <DialogContent className="w-180 flex flex-col justify-center items-center" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-2xl mb-5 text-center">
                        Exclusão de Produto
                    </DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Confirmar exclusão do produto.</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <div className="flex flex-col items-center gap-5 px-10 text-center tb:text-xl text-lg font-semibold">
                    <div>
                        <p>Deseja realmente excluir <strong>"{nomeProduto}"</strong>?</p>
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
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? "Excluindo..." : "Excluir"}
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
    );
}
