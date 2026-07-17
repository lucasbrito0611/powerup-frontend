'use client';

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search } from "lucide-react";
import { useTable } from "@refinedev/core";
import { useReactTable, getCoreRowModel, flexRender, SortingState, ColumnDef } from "@tanstack/react-table";

import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { ProductProps, CATEGORIA_MAP } from "@/types/products";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import AdminDetalhesProdutoModal from "@/components/modals/produto/AdminDetalhesProdutoModal";
import EditProdutoModal from "@/components/modals/produto/EditProdutoModal";
import ExcluirProdutoModal from "@/components/modals/produto/ExcluirProdutoModal";
import { formatCurrency } from "@/lib/utils";

export default function ProdutosAdmin() {
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
    } = useTable<ProductProps>({
        resource: "produtos",
        pagination: { mode: "server" },
    });

    const produtos = tableQuery.data?.data ?? [];
    const isLoading = tableQuery.isLoading;
    const totalRegistros = tableQuery.data?.total ?? 0;

    const onRefresh = () => {
        tableQuery.refetch();
    };

    // 2. Estados Locais da UI (TanStack Table)
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    // Sincronizar Ordenação
    useEffect(() => {
        if (sorting.length > 0) {
            setSorters([{ field: sorting[0].id, order: sorting[0].desc ? "desc" : "asc" }]);
        } else {
            setSorters([]);
        }
    }, [sorting, setSorters]);

    const [categoriaFilter, setCategoriaFilter] = useState('');

    // Sincronizar Pesquisa e Filtros
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

    const columns = useMemo<ColumnDef<ProductProps, any>[]>(() => [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "nome", header: "Nome" },
        { accessorKey: "preco", header: "Preço" },
        { accessorKey: "porcentagem_desconto", header: "Desconto" },
        { accessorKey: "categoria", header: "Categoria" },
        { accessorKey: "estoque", header: "Estoque", enableSorting: false },
        { id: "acoes", header: "Ações", enableSorting: false }
    ], []);

    // 3. Configurando a Tabela com o TanStack (Modo Manual/Servidor)
    const table = useReactTable({
        data: produtos,
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

    if (isLoading && produtos.length === 0) return (
        <div className="flex justify-center items-center h-[50vh]">
            <LoadingSpinner />
        </div>
    );

    return (
        <PageWrapper pageName="Produtos">
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
                            placeholder="Pesquisar produtos..."
                        />
                    </div>

                    <select
                        value={categoriaFilter}
                        onChange={e => setCategoriaFilter(e.target.value)}
                        className="p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-dark-grey focus:outline-none text-gray-700 font-medium"
                    >
                        <option value="">Todas as Categorias</option>
                        <option value="suplementos">Suplementos</option>
                        <option value="alimentos">Alimentos</option>
                        <option value="roupas">Roupas</option>
                        <option value="acessorios">Acessórios</option>
                    </select>
                </div>

                {/* Loading indicator sutil quando a tabela está atualizando */}
                {isLoading && produtos.length > 0 && (
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
                                        <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                                            Nenhum produto encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => {
                                        const produto = row.original;
                                        return (
                                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 text-center text-gray-600 font-medium border-r border-gray-100">
                                                    {produto.id}
                                                </td>
                                                <td className="p-4 text-center text-gray-800 font-medium border-r border-gray-100">
                                                    {produto.nome}
                                                </td>
                                                <td className="p-4 text-center text-gray-800 font-medium border-r border-gray-100">
                                                    {formatCurrency(produto.preco_calculado)}
                                                </td>
                                                <td className="p-4 text-center border-r border-gray-100">
                                                    {produto.porcentagem_desconto > 0 ? (
                                                        <span className="inline-block bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full text-sm">
                                                            {produto.porcentagem_desconto}% OFF
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">—</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center text-gray-600 border-r border-gray-100">
                                                    {CATEGORIA_MAP[produto.categoria] ?? produto.categoria}
                                                </td>
                                                <td className="p-4 text-center border-r border-gray-100">
                                                    <span className={`font-semibold text-sm ${(produto.estoque ?? 0) > 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                                        {produto.estoque ?? 0}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-2 xl:flex-row items-center justify-center">
                                                        <AdminDetalhesProdutoModal produto={produto} />
                                                        <EditProdutoModal
                                                            produto={produto}
                                                            className="max-xl:w-full bg-dark-grey hover:bg-[#2E2E2E] text-light-green text-base cursor-pointer"
                                                        />
                                                        <ExcluirProdutoModal
                                                            produtoId={produto.id}
                                                            nomeProduto={produto.nome}
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
                            Nenhum produto encontrado.
                        </div>
                    ) : (
                        table.getRowModel().rows.map(row => {
                            const produto = row.original;
                            return (
                                <div key={row.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                        <span className="font-bold text-gray-800">#{produto.id} — {produto.nome}</span>
                                        {produto.porcentagem_desconto > 0 && (
                                            <span className="text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                {produto.porcentagem_desconto}% OFF
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Preço:</span>
                                            <span className="font-medium text-gray-800">{formatCurrency(produto.preco_calculado)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Categoria:</span>
                                            <span className="font-medium text-gray-800">{CATEGORIA_MAP[produto.categoria] ?? produto.categoria}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Estoque:</span>
                                            <span className={`font-semibold ${(produto.estoque ?? 0) > 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                                {produto.estoque ?? 0} un.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                                        <AdminDetalhesProdutoModal produto={produto} className="w-full bg-blue-700 hover:bg-blue-800 text-white text-base cursor-pointer" />
                                        <EditProdutoModal
                                            produto={produto}
                                            className="w-full bg-dark-grey hover:bg-[#2E2E2E] text-light-green text-base cursor-pointer"
                                        />
                                        <ExcluirProdutoModal
                                            produtoId={produto.id}
                                            nomeProduto={produto.nome}
                                            className="col-span-2 w-full bg-[#FF360A] hover:bg-[#CC2D08] text-white text-base cursor-pointer"
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
                        Mostrando {produtos.length} de {totalRegistros} produtos
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
