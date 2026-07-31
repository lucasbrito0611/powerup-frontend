'use client';

import { useState } from "react";
import { X } from "lucide-react";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { AdminDetalhesDevolucaoModalProps, DEVOLUCAO_STATUS_MAP, DevolucaoStatusType } from "@/types/devolucao";
import { formatarData, formatCurrency } from "@/lib/utils";

const STATUS_COLORS: Record<DevolucaoStatusType, string> = {
    '1': 'bg-yellow-100 text-yellow-800',
    '2': 'bg-green-100 text-green-800',
    '3': 'bg-blue-100 text-blue-800',
    '4': 'bg-red-100 text-red-800',
    '5': 'bg-gray-100 text-gray-600',
};

// Extensões de vídeo conhecidas para detectar o tipo do arquivo pela URL
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.quicktime'];

function isVideoUrl(url: string): boolean {
    const lower = url.toLowerCase().split('?')[0]; // ignora query strings
    return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export default function AdminDetalhesDevolucaoModal({ devolucao }: AdminDetalhesDevolucaoModalProps) {
    const [open, setOpen] = useState(false);

    const statusColor = STATUS_COLORS[devolucao.status] ?? 'bg-gray-100 text-gray-600';
    const statusLabel = DEVOLUCAO_STATUS_MAP[devolucao.status] ?? devolucao.status_display;

    const isVideo = devolucao.arquivo ? isVideoUrl(devolucao.arquivo) : false;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="max-xl:w-full bg-blue-700 hover:bg-blue-800 text-white text-base cursor-pointer">
                    Detalhes
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:min-w-[700px]! w-full! max-w-[90dvw] max-h-[90vh] overflow-y-auto flex flex-col p-6 rounded-xl" aria-describedby={undefined}>
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-bold">
                        Solicitação de Devolução #{devolucao.id}
                    </DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>
                            Detalhes completos da solicitação de devolução #{devolucao.id}
                        </DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <div className="flex flex-col gap-5 text-base">

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-700">Status:</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                            {statusLabel}
                        </span>
                    </div>

                    {/* Informações Gerais */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div>
                            <span className="font-bold text-gray-700 block mb-0.5">Cliente:</span>
                            <span className="text-gray-800">{devolucao.user_nome || '—'}</span>
                        </div>
                        <div>
                            <span className="font-bold text-gray-700 block mb-0.5">Pedido:</span>
                            <span className="text-gray-800">#{devolucao.pedido_id}</span>
                        </div>
                        <div>
                            <span className="font-bold text-gray-700 block mb-0.5">Data da Solicitação:</span>
                            <span className="text-gray-800">{formatarData(devolucao.data_solicitacao)}</span>
                        </div>
                        <div>
                            <span className="font-bold text-gray-700 block mb-0.5">Total da Devolução:</span>
                            <span className="text-gray-800 font-semibold">{formatCurrency(devolucao.total)}</span>
                        </div>
                    </div>

                    {/* Motivo */}
                    <div>
                        <span className="font-bold text-gray-700 block mb-1">Motivo:</span>
                        <p className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {devolucao.motivo}
                        </p>
                    </div>

                    {/* Itens Devolvidos */}
                    {devolucao.itens && devolucao.itens.length > 0 && (
                        <div>
                            <span className="font-bold text-gray-700 block mb-2">Itens Devolvidos:</span>
                            <div className="flex flex-col gap-2">
                                {devolucao.itens.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-4 py-2">
                                        <span className="text-gray-700">{item.produto_nome}</span>
                                        <span className="font-semibold text-gray-800">Qtd: {item.quantidade}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Arquivo Anexado — renderização inline */}
                    <div>
                        <span className="font-bold text-gray-700 block mb-2">Arquivo Anexado:</span>
                        {devolucao.arquivo ? (
                            <div className="flex flex-col gap-2">
                                {isVideo ? (
                                    /* Vídeo: player inline com controls */
                                    <video
                                        src={devolucao.arquivo}
                                        controls
                                        className="w-full max-h-72 rounded-lg border border-gray-200 bg-black"
                                        preload="metadata"
                                    >
                                        Seu navegador não suporta reprodução de vídeo.
                                    </video>
                                ) : (
                                    /* Imagem: preview clicável em tamanho completo */
                                    <a href={devolucao.arquivo} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={devolucao.arquivo}
                                            alt="Evidência enviada pelo cliente"
                                            className="w-full max-h-72 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-zoom-in hover:opacity-90 transition-opacity"
                                        />
                                    </a>
                                )}
                                {/* Link de download sempre disponível abaixo da mídia */}
                                <a
                                    href={devolucao.arquivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium underline underline-offset-2 transition-colors self-start"
                                >
                                    Abrir/baixar arquivo original
                                </a>
                            </div>
                        ) : (
                            <span className="text-gray-400 italic">Nenhum arquivo anexado.</span>
                        )}
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
