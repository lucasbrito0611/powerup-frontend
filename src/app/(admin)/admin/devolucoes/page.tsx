'use client';

import { useState, useMemo, useEffect } from "react";
import { useTable } from "@refinedev/core";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    SortingState,
    ColumnDef
} from "@tanstack/react-table";

import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { DevolucaoProps, DEVOLUCAO_STATUS_MAP, DevolucaoStatusType } from "@/types/devolucao";
import { formatarData, formatCurrency } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search } from "lucide-react";
import AdminDetalhesDevolucaoModal from "@/components/modals/devolucao/AdminDetalhesDevolucaoModal";
import AdminEditDevolucaoModal from "@/components/modals/devolucao/AdminEditDevolucaoModal";
import AdminExcluirDevolucaoModal from "@/components/modals/devolucao/AdminExcluirDevolucaoModal";

const STATUS_COLORS: Record<DevolucaoStatusType, string> = {
    '1': 'bg-yellow-100 text-yellow-800',
    '2': 'bg-green-100 text-green-800',
    '3': 'bg-blue-100 text-blue-800',
    '4': 'bg-red-100 text-red-800',
    '5': 'bg-gray-100 text-gray-600',
};

export default function DevolucoesAdmin() {
    // 1. O Refine busca os dados (modo Servidor)
    const {
        tableQuery,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        pageCount,
        setSorters,
        setFilters
    } = useTable<DevolucaoProps>({
        resource: "devolucoes",
        pagination: { mode: "server" },
    });

    const devolucoes = tableQuery.data?.data ?? [];
    const isLoading = tableQuery.isLoading;
    const totalRegistros = tableQuery.data?.total ?? 0;

    // 2. Estados Locais da UI (TanStack Table)
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Sincronizar Ordenação
    useEffect(() => {
        if (sorting.length > 0) {
            setSorters([{ field: sorting[0].id, order: sorting[0].desc ? "desc" : "asc" }]);
        } else {
            setSorters([]);
        }
    }, [sorting, setSorters]);

    // Sincronizar Pesquisa e Filtros
    useEffect(() => {
        const newFilters: any[] = [];
        if (globalFilter) {
            newFilters.push({ field: "search", operator: "contains", value: globalFilter });
        }
        if (statusFilter) {
            newFilters.push({ field: "status", operator: "eq", value: statusFilter });
        }
        setFilters(newFilters, "replace");
        setCurrentPage(1);
    }, [globalFilter, statusFilter, setFilters, setCurrentPage]);

    const columns = useMemo<ColumnDef<DevolucaoProps, any>[]>(() => [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "user_nome", header: "Cliente" },
        { accessorKey: "motivo", header: "Motivo" },
        { accessorKey: "status", header: "Status" },
        { accessorKey: "data_solicitacao", header: "Data/Hora" },
        { id: "acoes", header: "Ações", enableSorting: false }
    ], []);

    // 3. Configurando a Tabela com o TanStack (Modo Manual/Servidor)
    const table = useReactTable({
        data: devolucoes,
        columns,
        pageCount: pageCount,
        state: {
            sorting,
            globalFilter,
            pagination: {
                pageIndex: currentPage - 1,
                pageSize: pageSize,
            }
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newState = updater({ pageIndex: currentPage - 1, pageSize });
                setCurrentPage(newState.pageIndex + 1);
                setPageSize(newState.pageSize);
            } else {
                setCurrentPage(updater.pageIndex + 1);
                setPageSize(updater.pageSize);
            }
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading && devolucoes.length === 0) return (
        <div className="flex justify-center items-center h-[50vh]">
            <LoadingSpinner />
        </div>
    );

    return (
        <PageWrapper pageName="Devoluções">
            <section className="w-full relative">

                {/* Controles de Filtro e Pesquisa */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 relative">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={e => setGlobalFilter(e.target.value)}
                            className="pl-10 p-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-dark-grey focus:outline-none"
                            placeholder="Pesquisar por cliente ou motivo..."
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-dark-grey focus:outline-none text-gray-700 font-medium"
                    >
                        <option value="">Todos os Status</option>
                        <option value="1">Pendente</option>
                        <option value="2">Aprovada</option>
                        <option value="3">Reembolsado</option>
                        <option value="4">Recusada</option>
                        <option value="5">Cancelada</option>
                    </select>
                </div>

                {/* Loading indicator sutil quando a tabela está atualizando */}
                {isLoading && devolucoes.length > 0 && (
                    <div className="absolute top-0 right-0 p-2">
                        <LoadingSpinner />
                    </div>
                )}

                {/* Desktop View */}
                <div className="hidden sm:block bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#333] text-white">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                className={`p-4 font-semibold text-center border-r border-gray-600 select-none transition-colors ${header.column.getCanSort() ? 'cursor-pointer hover:bg-[#444]' : ''}`}
                                            >
                                                <div className="flex items-center justify-center gap-1">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : null}
                                                    {header.column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className={isLoading ? "opacity-50 transition-opacity" : ""}>
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                            Nenhuma solicitação de devolução encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => {
                                        const devolucao = row.original;
                                        const statusColor = STATUS_COLORS[devolucao.status] ?? 'bg-gray-100 text-gray-600';
                                        return (
                                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 text-center text-gray-600 font-medium border-r border-gray-100">
                                                    {devolucao.id}
                                                </td>
                                                <td className="p-4 text-center text-gray-800 font-medium border-r border-gray-100">
                                                    {devolucao.user_nome || '—'}
                                                </td>
                                                <td className="p-4 text-center text-gray-700 border-r border-gray-100 max-w-[220px]">
                                                    <span className="line-clamp-2 text-sm">{devolucao.motivo}</span>
                                                </td>
                                                <td className="p-4 text-center border-r border-gray-100">
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                                                        {DEVOLUCAO_STATUS_MAP[devolucao.status] ?? devolucao.status_display}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center text-gray-600 border-r border-gray-100 whitespace-nowrap">
                                                    {formatarData(devolucao.data_solicitacao)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-2 xl:flex-row items-center justify-center">
                                                        <AdminDetalhesDevolucaoModal devolucao={devolucao} />
                                                        <AdminEditDevolucaoModal
                                                            devolucao={devolucao}
                                                            className="max-xl:w-full bg-dark-grey hover:bg-[#2E2E2E] text-light-green text-base cursor-pointer"
                                                        />
                                                        <AdminExcluirDevolucaoModal
                                                            devolucaoId={devolucao.id}
                                                            className="max-xl:w-full bg-[#FF360A] hover:bg-[#CC2D08] text-white text-base cursor-pointer"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile View */}
                <div className={`sm:hidden space-y-4 ${isLoading ? "opacity-50 transition-opacity" : ""}`}>
                    {table.getRowModel().rows.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center text-gray-500 italic">
                            Nenhuma solicitação de devolução encontrada.
                        </div>
                    ) : (
                        table.getRowModel().rows.map(row => {
                            const devolucao = row.original;
                            const statusColor = STATUS_COLORS[devolucao.status] ?? 'bg-gray-100 text-gray-600';
                            return (
                                <div key={row.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                        <span className="font-bold text-gray-800">#{devolucao.id}</span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>
                                            {DEVOLUCAO_STATUS_MAP[devolucao.status] ?? devolucao.status_display}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Cliente:</span>
                                            <span className="font-medium text-gray-800">{devolucao.user_nome || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Total:</span>
                                            <span className="font-medium text-gray-800">{formatCurrency(devolucao.total)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Data:</span>
                                            <span className="font-medium text-gray-800">{formatarData(devolucao.data_solicitacao)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block mb-1">Motivo:</span>
                                            <p className="text-gray-700 text-sm line-clamp-2">{devolucao.motivo}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-100">
                                        <AdminDetalhesDevolucaoModal devolucao={devolucao} />
                                        <AdminEditDevolucaoModal
                                            devolucao={devolucao}
                                            className="w-full bg-dark-grey hover:bg-[#2E2E2E] text-light-green text-base cursor-pointer"
                                        />
                                        <AdminExcluirDevolucaoModal
                                            devolucaoId={devolucao.id}
                                            className="w-full bg-[#FF360A] hover:bg-[#CC2D08] text-white text-base cursor-pointer"
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Controles de Paginação */}
                <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="text-sm text-gray-600">
                        Mostrando {devolucoes.length} de {totalRegistros} solicitações
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium px-4">
                            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

            </section>
        </PageWrapper>
    );
}
