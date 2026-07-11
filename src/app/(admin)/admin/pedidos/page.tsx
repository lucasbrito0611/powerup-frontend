'use client';

import { useState, useMemo } from "react";
import { useTable } from "@refinedev/core";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender, SortingState, ColumnDef } from "@tanstack/react-table";

import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { PedidoProps } from "@/types";
import { formatarData } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import AdminDetalhesPedidoModal from "@/components/modals/pedido/AdminDetalhesPedidoModal";
import { ChevronDown, ChevronUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search } from "lucide-react";

const STATUS_MAP = {
    '1': 'Processando',
    '2': 'Enviado',
    '3': 'Entregue',
    '4': 'Finalizado',
    '5': 'Cancelado'
};

const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(value));
};

export default function PedidosAdmin() {
    const { tableQuery } = useTable<PedidoProps>({
        pagination: { mode: "off" },
    });

    const pedidos = tableQuery.data?.data ?? [];
    const isLoading = tableQuery.isLoading;

    // 2. Estados para o TanStack Table
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo<ColumnDef<PedidoProps, any>[]>(() => [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "user_nome", header: "Usuário" },
        { accessorKey: "total", header: "Total" },
        { accessorKey: "status", header: "Status" },
        { accessorKey: "dt_hora", header: "Data/Hora" },
        { id: "acoes", header: "Ações" }
    ], []);

    // 3. Configurando a Tabela com o TanStack
    const table = useReactTable({
        data: pedidos,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: { pageSize: 10 }
        }
    });

    if (isLoading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <LoadingSpinner />
        </div>
    );

    return (
        <PageWrapper pageName="Pedidos">
            <section className="w-full">
                
                {/* Barra de Pesquisa */}
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={globalFilter}
                        onChange={e => setGlobalFilter(e.target.value)}
                        className="pl-10 p-3 border border-gray-200 rounded-lg w-full max-w-md focus:ring-2 focus:ring-dark-grey focus:outline-none"
                        placeholder="Pesquisar pedidos..."
                    />
                </div>

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
                                                onClick={header.column.getToggleSortingHandler()}
                                                className="p-4 font-semibold text-center border-r border-gray-600 cursor-pointer select-none hover:bg-[#444] transition-colors"
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
                            <tbody>
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                            Nenhum pedido encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => {
                                        const pedido = row.original;
                                        return (
                                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 text-center text-gray-600 font-medium border-r border-gray-100">
                                                    {pedido.id}
                                                </td>
                                                <td className="p-4 text-center text-gray-800 font-medium border-r border-gray-100">
                                                    {pedido.user_nome || "-"}
                                                </td>
                                                <td className="p-4 text-center text-gray-800 font-medium border-r border-gray-100">
                                                    {formatCurrency(pedido.total)}
                                                </td>
                                                <td className="p-4 text-center text-gray-600 border-r border-gray-100">
                                                    {STATUS_MAP[pedido.status as keyof typeof STATUS_MAP] || pedido.status}
                                                </td>
                                                <td className="p-4 text-center text-gray-600 border-r border-gray-100">
                                                    {formatarData(pedido.dt_hora)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-2 xl:flex-row items-center justify-center">
                                                        <AdminDetalhesPedidoModal pedido={pedido} />
                                                        <Button className="max-xl:w-full bg-dark-grey text-light-green text-base cursor-pointer">
                                                            Editar
                                                        </Button>
                                                        <Button className="max-xl:w-full bg-[#FF360A] hover:bg-[#CC2D08] text-white text-base cursor-pointer">
                                                            Excluir
                                                        </Button>
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
                <div className="sm:hidden space-y-4">
                    {table.getRowModel().rows.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center text-gray-500 italic">
                            Nenhum pedido encontrado.
                        </div>
                    ) : (
                        table.getRowModel().rows.map(row => {
                            const pedido = row.original;
                            return (
                                <div key={row.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                        <span className="font-bold text-gray-800">#{pedido.id}</span>
                                        <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">
                                            {STATUS_MAP[pedido.status as keyof typeof STATUS_MAP] || pedido.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Usuário:</span>
                                            <span className="font-medium text-gray-800">{pedido.user_nome || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Total:</span>
                                            <span className="font-medium text-gray-800">{formatCurrency(pedido.total)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Data:</span>
                                            <span className="font-medium text-gray-800">{formatarData(pedido.dt_hora)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-100">
                                        <AdminDetalhesPedidoModal pedido={pedido} />
                                        <Button className="w-full bg-dark-grey text-light-green text-base cursor-pointer">
                                            Editar
                                        </Button>
                                        <Button className="w-full bg-[#FF360A] hover:bg-[#CC2D08] text-white text-base cursor-pointer">
                                            Excluir
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Controles de Paginação */}
                <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="text-sm text-gray-600">
                        Mostrando {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length} pedidos
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