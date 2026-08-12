'use client';

import { useState, useRef, useEffect } from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Search } from "lucide-react";
import { useCreate, useList } from "@refinedev/core";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { notify } from "@/lib/toast";
import { criarNotificacaoSchema, CriarNotificacaoSchemaType } from "@/schemas/criarNotificacaoSchema";
import LoadingContainer from "@/components/loading/LoadingContainer";

interface ClienteProps {
    id: number;
    nome: string;
}

const CATEGORIAS = [
    { value: 'status_pedido',          label: 'Status do Pedido' },
    { value: 'status_devolucao',       label: 'Status da Devolução' },
    { value: 'mensagem_personalizada', label: 'Mensagem Geral' },
    { value: 'promocao',               label: 'Promoção' },
    { value: 'seguranca',              label: 'Segurança' },
];

interface CriarNotificacaoModalProps {
    className?: string;
    onSuccess?: () => void;
}

export default function CriarNotificacaoModal({ className, onSuccess }: CriarNotificacaoModalProps) {
    const [open, setOpen] = useState(false);
    const { mutate, mutation } = useCreate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Lista de clientes usando o Refine
    const { query: clientesQuery } = useList<ClienteProps>({
        resource: "clientes",
        pagination: { mode: "off" },
    });

    const clientes = clientesQuery.data?.data ?? [];
    const isLoadingClientes = clientesQuery.isLoading;

    const clientesFiltrados = clientes.filter((c: ClienteProps) =>
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<CriarNotificacaoSchemaType>({
        resolver: zodResolver(criarNotificacaoSchema),
        defaultValues: {
            cliente: "",
            enviar_para_todos: false,
            categoria: "mensagem_personalizada",
            titulo: "",
            texto: "",
        },
    });

    const clienteSelecionado = watch("cliente");
    const enviarParaTodos = watch("enviar_para_todos");

    // Fechar dropdown de busca ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            reset();
            setSearchTerm('');
            setIsDropdownOpen(false);
        }
        setOpen(isOpen);
    };

    const handleToggleEnviarParaTodos = (checked: boolean) => {
        setValue("enviar_para_todos", checked, { shouldValidate: true });
        if (checked) {
            setValue("cliente", "", { shouldValidate: true });
            setIsDropdownOpen(false);
        }
    };

    const handleSelectCliente = (clienteId: number) => {
        setValue("cliente", String(clienteId), { shouldValidate: true });
        setValue("enviar_para_todos", false, { shouldValidate: true });
        setSearchTerm("");
        setIsDropdownOpen(false);
    };

    const onSubmit = (data: CriarNotificacaoSchemaType) => {
        const payload: any = {
            categoria: data.categoria,
            titulo: data.titulo,
            texto: data.texto,
            enviar_para_todos: data.enviar_para_todos,
        };

        if (!data.enviar_para_todos && data.cliente) {
            payload.cliente = Number(data.cliente);
        }

        mutate(
            {
                resource: "notificacoes",
                values: payload,
                invalidates: ["all"],
            },
            {
                onSuccess: (res: any) => {
                    setOpen(false);
                    reset();
                    const mensagem = res?.data?.detail || "Notificação enviada com sucesso!";
                    notify(mensagem, "success");
                    onSuccess?.();
                },
                onError: (error: any) => {
                    if (error.response) {
                        const erros = error.response.data.detail || error.response.data.errors || "Erro ao enviar notificação";
                        notify(erros, "error");
                    } else {
                        notify("Erro ao enviar notificação. Tente novamente.", "error");
                    }
                },
            }
        );
    };

    const onError = (errs: FieldErrors<CriarNotificacaoSchemaType>) => {
        const first = Object.values(errs)[0];
        if (first && "message" in first) {
            notify(first.message as string, "warning");
        } else {
            notify("Preencha todos os campos obrigatórios", "warning");
        }
    };

    const selectedClientName = clientes.find((c: ClienteProps) => c.id === Number(clienteSelecionado))?.nome || "Selecione um cliente...";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button variant="submit" size="submit" className={className}>
                    <Plus className="w-4 h-4" />
                    Nova Notificação
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:min-w-[650px]! w-full! max-w-[90dvw] max-h-[90vh] overflow-y-auto flex flex-col py-8 px-6" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-2xl mb-2">
                        Nova Notificação
                    </DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>Preencha os campos para enviar uma nova notificação</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-5 w-full">
                    <LoadingContainer loading={mutation.isPending}>

                        {/* ── Cliente - Searchable Dropdown ── */}
                        <div className="flex flex-col gap-1 sm:text-base w-full relative" ref={dropdownRef}>
                            <strong>Cliente:*</strong>
                            <div
                                className={`input h-10 px-3 flex items-center justify-between ${
                                    enviarParaTodos ? "opacity-50 cursor-not-allowed bg-gray-100" : "cursor-pointer"
                                }`}
                                onClick={() => {
                                    if (!enviarParaTodos) setIsDropdownOpen(!isDropdownOpen);
                                }}
                            >
                                <span className={clienteSelecionado && !enviarParaTodos ? "text-gray-800" : "text-gray-400"}>
                                    {enviarParaTodos ? "Opção 'Enviar para todos' selecionada" : selectedClientName}
                                </span>
                            </div>

                            {isDropdownOpen && !enviarParaTodos && (
                                <div className="absolute top-[70px] left-0 w-full bg-white border border-gray-200 shadow-lg z-50 rounded-sm max-h-60 flex flex-col">
                                    <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                                        <Search className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Pesquisar cliente..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full outline-none text-sm"
                                        />
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                        {isLoadingClientes ? (
                                            <div className="p-3 text-sm text-gray-500 text-center">Carregando clientes...</div>
                                        ) : clientesFiltrados.length === 0 ? (
                                            <div className="p-3 text-sm text-gray-500 text-center">Nenhum cliente encontrado.</div>
                                        ) : (
                                            clientesFiltrados.map((cliente: ClienteProps) => (
                                                <div
                                                    key={cliente.id}
                                                    className="p-2 px-3 text-sm hover:bg-gray-100 cursor-pointer text-gray-800"
                                                    onClick={() => handleSelectCliente(cliente.id)}
                                                >
                                                    {cliente.nome}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                            <input type="hidden" {...register("cliente")} />
                            {errors.cliente && !enviarParaTodos && (
                                <p className="text-red-500 text-sm mt-1">{errors.cliente.message}</p>
                            )}
                        </div>

                        {/* ── Checkbox Enviar para Todos ── */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer w-fit select-none">
                                <input
                                    type="checkbox"
                                    checked={enviarParaTodos}
                                    onChange={(e) => handleToggleEnviarParaTodos(e.target.checked)}
                                    className="w-4 h-4 accent-dark-grey cursor-pointer rounded"
                                />
                                <span className="font-semibold text-gray-800 text-sm">Enviar para todos</span>
                            </label>
                            <span className="text-xs text-gray-500">
                                Selecione um cliente específico OU marque para enviar para todos os clientes.
                            </span>
                        </div>

                        {/* ── Categoria ── */}
                        <label className="flex flex-col gap-1 sm:text-base">
                            <strong>Categoria:*</strong>
                            <select {...register("categoria")} className="input h-10 px-2">
                                {CATEGORIAS.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            {errors.categoria && <p className="text-red-500 text-sm">{errors.categoria.message}</p>}
                        </label>

                        {/* ── Título ── */}
                        <label className="flex flex-col gap-1 sm:text-base">
                            <strong>Título:*</strong>
                            <input
                                {...register("titulo")}
                                placeholder="Título da notificação"
                                className="input h-10 px-3"
                            />
                            {errors.titulo && <p className="text-red-500 text-sm">{errors.titulo.message}</p>}
                        </label>

                        {/* ── Texto ── */}
                        <label className="flex flex-col gap-1 sm:text-base">
                            <strong>Texto:*</strong>
                            <textarea
                                {...register("texto")}
                                placeholder="Texto da notificação"
                                className="input min-h-[100px] p-3 resize-y"
                            />
                            {errors.texto && <p className="text-red-500 text-sm">{errors.texto.message}</p>}
                        </label>

                        {/* ── Botões Ação ── */}
                        <div className="flex gap-8 mt-3 justify-center">
                            <Button variant="submit" size="submit" type="submit">
                                Enviar Notificação
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
