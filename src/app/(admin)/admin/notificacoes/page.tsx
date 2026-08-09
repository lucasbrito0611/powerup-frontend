'use client';

import { useTable } from "@refinedev/core";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";

import PageWrapper from "@/components/layout/PageWrapper";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { formatarData } from "@/lib/utils";
import EditNotificacaoModal from "@/components/modals/notificacao/EditNotificacaoModal";
import ExcluirNotificacaoModal from "@/components/modals/notificacao/ExcluirNotificacaoModal";
import CriarNotificacaoModal from "@/components/modals/notificacao/CriarNotificacaoModal";

interface NotificacaoAdmin {
    id: number;
    cliente_nome: string | null;
    categoria: string;
    categoria_display: string;
    titulo: string;
    texto: string;
    data_envio: string;
}

const CATEGORIAS = [
    { value: 'status_pedido',          label: 'Status do Pedido' },
    { value: 'status_devolucao',       label: 'Status da Devolução' },
    { value: 'mensagem_personalizada', label: 'Mensagem Geral' },
    { value: 'promocao',               label: 'Promoção' },
    { value: 'seguranca',              label: 'Segurança' },
];

export default function NotificacoesAdmin() {
    const {
        tableQuery,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        pageCount,
        setFilters,
    } = useTable<NotificacaoAdmin>({
        resource: "notificacoes_admin",
        pagination: { mode: "server" },
    });

    const notificacoes = tableQuery.data?.data ?? [];
    const isLoading = tableQuery.isLoading;
    const total = tableQuery.data?.total ?? 0;

    // ─── Estados de filtro ────────────────────────────────────────────────────
    const [globalFilter, setGlobalFilter] = useState('');
    const [categoriaFilter, setCategoriaFilter] = useState('');

    useEffect(() => {
        const newFilters: any[] = [];
        if (globalFilter) {
            newFilters.push({ field: "search", operator: "contains", value: globalFilter });
        }
        if (categoriaFilter) {
            newFilters.push({ field: "categoria", operator: "eq", value: categoriaFilter });
        }
        setFilters(newFilters, "replace");
        setCurrentPage(1);
    }, [globalFilter, categoriaFilter, setFilters, setCurrentPage]);

    // ─── Colunas ─────────────────────────────────────────────────────────────
    const columns = useMemo<ColumnDef<NotificacaoAdmin>[]>(() => [
        { accessorKey: "id",                header: "ID" },
        { accessorKey: "cliente_nome",      header: "Cliente",    cell: ({ getValue }) => getValue() ?? "—" },
        { accessorKey: "categoria_display", header: "Categoria" },
        { accessorKey: "titulo",            header: "Título" },
        {
            accessorKey: "texto",
            header: "Texto",
            cell: ({ getValue }) => (
                <span
                    className="line-clamp-2 text-sm max-w-xs block text-left"
                    dangerouslySetInnerHTML={{ __html: getValue() as string }}
                />
            ),
        },
        {
            accessorKey: "data_envio",
            header: "Data/Hora",
            cell: ({ getValue }) => formatarData(getValue() as string),
        },
        {
            id: "acoes",
            header: "Ações",
            enableSorting: false,
            cell: ({ row }) => {
                const n = row.original;
                return (
                    <div className="flex flex-col gap-2 items-center">
                        <EditNotificacaoModal
                            notificacao={{ id: n.id, categoria: n.categoria, titulo: n.titulo, texto: n.texto }}
                            onSuccess={() => tableQuery.refetch()}
                            className="w-full bg-dark-grey hover:bg-[#2E2E2E] text-light-green text-base cursor-pointer"
                        />
                        <ExcluirNotificacaoModal
                            notificacaoId={n.id}
                            onSuccess={() => tableQuery.refetch()}
                            className="w-full bg-[#FF360A] hover:bg-[#CC2D08] text-white text-base cursor-pointer"
                        />
                    </div>
                );
            },
        },
    ], [tableQuery]);

    // ─── Tabela TanStack ──────────────────────────────────────────────────────
    const table = useReactTable({
        data: notificacoes,
        columns,
        pageCount,
        state: { pagination: { pageIndex: currentPage - 1, pageSize } },
        onPaginationChange: (updater) => {
            const next = typeof updater === "function"
                ? updater({ pageIndex: currentPage - 1, pageSize })
                : updater;
            setCurrentPage(next.pageIndex + 1);
            setPageSize(next.pageSize);
        },
        manualPagination: true,
        manualFiltering: true,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading && notificacoes.length === 0) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <PageWrapper pageName="Notificações">
            <section className="w-full relative">

                {/* ── Barra de Pesquisa + Filtro de Categoria + Botão Criar ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={globalFilter}
                                onChange={e => setGlobalFilter(e.target.value)}
                                className="pl-10 p-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-dark-grey focus:outline-none"
                                placeholder="Pesquisar por cliente, título ou texto..."
                            />
                        </div>

                        <select
                            value={categoriaFilter}
                            onChange={e => setCategoriaFilter(e.target.value)}
                            className="p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-dark-grey focus:outline-none text-gray-700 font-medium"
                        >
                            <option value="">Todas as Categorias</option>
                            {CATEGORIAS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <CriarNotificacaoModal onSuccess={() => tableQuery.refetch()} />
                </div>


                {/* Loading indicator sutil durante atualização */}
                {isLoading && notificacoes.length > 0 && (
                    <div className="absolute top-0 right-0 p-2">
                        <LoadingSpinner />
                    </div>
                )}

                {/* ── Desktop View ── */}
                <div className="hidden sm:block bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-[#333] text-white">
                                {table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id}>
                                        {hg.headers.map(header => (
                                            <th key={header.id} className="p-4 font-semibold text-center border-r border-gray-600 whitespace-nowrap">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className={isLoading ? "opacity-50 transition-opacity" : ""}>
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                                            Nenhuma notificação encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="p-4 text-center text-gray-700 border-r border-gray-100 align-middle">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Mobile View — Cards ── */}
                <div className={`sm:hidden space-y-4 ${isLoading ? "opacity-50 transition-opacity" : ""}`}>
                    {table.getRowModel().rows.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center text-gray-500 italic">
                            Nenhuma notificação encontrada.
                        </div>
                    ) : (
                        table.getRowModel().rows.map(row => {
                            const n = row.original;
                            return (
                                <div key={row.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                    <div className="flex justify-between items-start mb-3 pb-2 border-b border-gray-100">
                                        <div>
                                            <span className="font-bold text-gray-800">#{n.id} — {n.titulo}</span>
                                            <p className="text-xs text-gray-500 mt-0.5">{n.categoria_display}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0 ml-2">{formatarData(n.data_envio)}</span>
                                    </div>

                                    <div className="space-y-2 mb-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Cliente:</span>
                                            <span className="font-medium text-gray-800">{n.cliente_nome ?? "—"}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-500">Texto:</span>
                                            <span
                                                className="text-gray-700 text-xs line-clamp-3"
                                                dangerouslySetInnerHTML={{ __html: n.texto }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                                        <EditNotificacaoModal
                                            notificacao={{ id: n.id, categoria: n.categoria, titulo: n.titulo, texto: n.texto }}
                                            onSuccess={() => tableQuery.refetch()}
                                            className="w-full bg-dark-grey hover:bg-[#2E2E2E] text-light-green text-base cursor-pointer"
                                        />
                                        <ExcluirNotificacaoModal
                                            notificacaoId={n.id}
                                            onSuccess={() => tableQuery.refetch()}
                                            className="w-full bg-[#FF360A] hover:bg-[#CC2D08] text-white text-base cursor-pointer"
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>


                {/* ── Paginação ── */}
                <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
                    <span className="text-sm text-gray-600">
                        Mostrando {notificacoes.length} de {total} notificações
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium px-4">
                            Página {currentPage} de {table.getPageCount() || 1}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

            </section>
        </PageWrapper>
    );
}
