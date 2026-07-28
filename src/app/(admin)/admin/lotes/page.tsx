'use client';

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search } from "lucide-react";
import { useTable } from "@refinedev/core";
import { useReactTable, getCoreRowModel, flexRender, SortingState, ColumnDef } from "@tanstack/react-table";

import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { Lote } from "@/types/lote";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";

import CriarLoteModal from "@/components/modals/lote/CriarLoteModal";
import EditLoteModal from "@/components/modals/lote/EditLoteModal";
import ExcluirLoteModal from "@/components/modals/lote/ExcluirLoteModal";


const formatarDataLocal = (dateString?: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString + "T12:00:00");
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR");
};

export default function LotesAdmin() {
    const {
        tableQuery,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        pageCount,
        setSorters,
        setFilters
    } = useTable<Lote>({
        resource: "lotes",
        pagination: { mode: "server" },
        sorters: {
            initial: [
                {
                    field: "data_entrada",
                    order: "desc",
                },
            ],
        },
    });

    const lotes = tableQuery.data?.data ?? [];
    const isLoading = tableQuery.isLoading;
    const totalRegistros = tableQuery.data?.total ?? 0;

    const onRefresh = () => {
        tableQuery.refetch();
    };

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    useEffect(() => {
        if (sorting.length > 0) {
            setSorters([{ field: sorting[0].id, order: sorting[0].desc ? "desc" : "asc" }]);
        } else {
            setSorters([{ field: "data_entrada", order: "desc" }]);
        }
    }, [sorting, setSorters]);

    useEffect(() => {
        const newFilters: any[] = [];
        if (globalFilter) {
            newFilters.push({ field: "search", operator: "contains", value: globalFilter });
        }
        setFilters(newFilters, "replace");
        setCurrentPage(1);
    }, [globalFilter, setFilters, setCurrentPage]);

    const columns = useMemo<ColumnDef<Lote, any>[]>(() => [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "produto_nome", header: "Nome do Produto" },
        { accessorKey: "quantidade", header: "Quantidade" },
        { accessorKey: "validade", header: "Validade" },
        { accessorKey: "data_entrada", header: "Data de Entrada" },
        { id: "acoes", header: "Ações", enableSorting: false }
    ], []);

    const table = useReactTable({
        data: lotes,
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

    if (isLoading && lotes.length === 0) return (
        <div className="flex justify-center items-center h-[50vh]">
            <LoadingSpinner />
        </div>
    );

    return (
        <PageWrapper pageName="Lotes">
            <section className="w-full relative">

                {/* Controles de Filtro e Pesquisa */}
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
                                placeholder="Pesquisar lotes (ex: nome do produto)..."
                            />
                        </div>
                    </div>

                    <CriarLoteModal onSuccess={onRefresh} />
                </div>

                {isLoading && lotes.length > 0 && (
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
                                            Nenhum lote encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => {
                                        const lote = row.original;
                                        return (
                                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 text-center text-gray-600 font-medium border-r border-gray-100">
                                                    {lote.id}
                                                </td>
                                                <td className="p-4 text-center text-gray-800 font-medium border-r border-gray-100">
                                                    {lote.produto_nome}
                                                </td>
                                                <td className="p-4 text-center text-gray-800 font-medium border-r border-gray-100">
                                                    {lote.quantidade} un.
                                                </td>
                                                <td className="p-4 text-center text-gray-600 border-r border-gray-100">
                                                    {formatarDataLocal(lote.validade)}
                                                </td>
                                                <td className="p-4 text-center text-gray-600 border-r border-gray-100">
                                                    {formatarDataLocal(lote.data_entrada)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-2 xl:flex-row items-center justify-center">
                                                        <EditLoteModal
                                                            lote={lote}
                                                            className="max-xl:w-full bg-dark-grey hover:bg-[#2E2E2E] text-light-green text-base cursor-pointer"
                                                            onSuccess={onRefresh}
                                                        />
                                                        <ExcluirLoteModal
                                                            lote={lote}
                                                            className="max-xl:w-full bg-[#FF360A] hover:bg-[#CC2D08] text-white text-base cursor-pointer"
                                                            onSuccess={onRefresh}
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
                            Nenhum lote encontrado.
                        </div>
                    ) : (
                        table.getRowModel().rows.map(row => {
                            const lote = row.original;
                            return (
                                <div key={row.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                        <span className="font-bold text-gray-800">#{lote.id} — {lote.produto_nome}</span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Quantidade:</span>
                                            <span className="font-medium text-gray-800">{lote.quantidade} un.</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Validade:</span>
                                            <span className="font-medium text-gray-800">{formatarDataLocal(lote.validade)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Data de Entrada:</span>
                                            <span className="font-medium text-gray-800">{formatarDataLocal(lote.data_entrada)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                                        <EditLoteModal
                                            lote={lote}
                                            className="w-full bg-dark-grey hover:bg-[#2E2E2E] text-light-green text-base cursor-pointer"
                                            onSuccess={onRefresh}
                                        />
                                        <ExcluirLoteModal
                                            lote={lote}
                                            className="w-full bg-[#FF360A] hover:bg-[#CC2D08] text-white text-base cursor-pointer"
                                            onSuccess={onRefresh}
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
                        Mostrando {lotes.length} de {totalRegistros} lotes
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
