'use client'
import { useState } from "react"

import { X, FileClock, ThumbsUp, CircleDollarSign, XCircle, Ban } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import { Button } from "@/components/ui/button"
import { DevolucaoProps, DevolucaoStatusType, DEVOLUCAO_STATUS_MAP } from "@/types/devolucao"
import { formatarData, formatarPreco } from "@/lib/utils"

const STATUS_INFO: Record<DevolucaoStatusType, { icon: React.ReactNode; color: string }> = {
    '1': { icon: <FileClock size={18} />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    '2': { icon: <ThumbsUp size={18} />,  color: 'text-blue-600 bg-blue-50 border-blue-200' },
    '3': { icon: <CircleDollarSign size={18} />, color: 'text-green-600 bg-green-50 border-green-200' },
    '4': { icon: <XCircle size={18} />,   color: 'text-red-600 bg-red-50 border-red-200' },
    '5': { icon: <Ban size={18} />,       color: 'text-gray-500 bg-gray-50 border-gray-200' },
};

// Extensões de vídeo para detectar o tipo do arquivo pela URL
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.quicktime'];

function isVideoUrl(url: string): boolean {
    const lower = url.toLowerCase().split('?')[0];
    return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

interface DetalhesDevolucaoModalProps {
    devolucao: DevolucaoProps;
}

export default function DetalhesDevolucaoModal({ devolucao }: DetalhesDevolucaoModalProps) {
    const [open, setOpen] = useState(false);

    const statusInfo = STATUS_INFO[devolucao.status];
    const statusLabel = DEVOLUCAO_STATUS_MAP[devolucao.status];

    const isVideo = devolucao.arquivo ? isVideoUrl(devolucao.arquivo) : false;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="submit" className="!py-1 max-md:py-5 !text-sm">
                    Ver detalhes
                </Button>
            </DialogTrigger>

            <DialogContent className="!w-200 !max-w-[90dvw] !max-h-[90dvh] overflow-y-auto flex flex-col" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="sm:text-2xl text-xl font-semibold px-5 pt-2">
                        Solicitação de Devolução #{devolucao.id}
                    </DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>
                            Detalhes da sua solicitação de devolução #{devolucao.id}
                        </DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <div className="flex flex-col gap-6 px-5 pb-5">

                    {/* Status */}
                    <div className={`flex items-center gap-2 self-start px-3 py-1.5 rounded-full border text-sm font-semibold ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span>{statusLabel}</span>
                    </div>

                    {/* Informações gerais */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="font-semibold text-gray-600 block mb-0.5">Pedido referente:</span>
                            <span className="text-gray-900">#{devolucao.pedido_id}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600 block mb-0.5">Data da solicitação:</span>
                            <span className="text-gray-900">{formatarData(devolucao.data_solicitacao)}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600 block mb-0.5">Total solicitado:</span>
                            <span className="text-gray-900 font-semibold">R$ {formatarPreco(devolucao.total)}</span>
                        </div>
                    </div>

                    {/* Motivo */}
                    <div className="text-sm">
                        <span className="font-semibold text-gray-600 block mb-1">Motivo informado:</span>
                        <p className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {devolucao.motivo}
                        </p>
                    </div>

                    {/* Itens devolvidos */}
                    {devolucao.itens && devolucao.itens.length > 0 && (
                        <div className="text-sm">
                            <span className="font-semibold text-gray-600 block mb-2">
                                Itens incluídos ({devolucao.itens.length}):
                            </span>
                            <div className="flex flex-col gap-2">
                                {devolucao.itens.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-4 py-2"
                                    >
                                        <span className="text-gray-700">{item.produto_nome}</span>
                                        <span className="font-semibold text-gray-900">Qtd: {item.quantidade}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Arquivo enviado */}
                    <div className="text-sm">
                        <span className="font-semibold text-gray-600 block mb-2">Arquivo enviado:</span>
                        {devolucao.arquivo ? (
                            <div className="flex flex-col gap-2">
                                {isVideo ? (
                                    <video
                                        src={devolucao.arquivo}
                                        controls
                                        className="w-full max-h-64 rounded-lg border border-gray-200 bg-black"
                                        preload="metadata"
                                    >
                                        Seu navegador não suporta reprodução de vídeo.
                                    </video>
                                ) : (
                                    <a href={devolucao.arquivo} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={devolucao.arquivo}
                                            alt="Arquivo enviado na solicitação"
                                            className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-zoom-in hover:opacity-90 transition-opacity"
                                        />
                                    </a>
                                )}
                                <a
                                    href={devolucao.arquivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium underline underline-offset-2 transition-colors self-start"
                                >
                                    Abrir/baixar arquivo
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
    )
}
