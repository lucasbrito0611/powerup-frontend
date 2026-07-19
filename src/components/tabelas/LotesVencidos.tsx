'use client'
import { useState, useRef, useEffect } from "react";
import { LotesVencidosProps } from "@/types/lote";
import ExcluirLoteModal from "../modals/ExcluirLoteModal";

export function LotesVencidos({ dados, total, onRefresh }: LotesVencidosProps) {

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString + 'T00:00:00');
        return new Intl.DateTimeFormat('pt-BR').format(date);
    };

    // Atualiza o estado indeterminado do checkbox do cabeçalho
    useEffect(() => {
        if (!headerCheckboxRef.current) return;
        const allSelected = dados.length > 0 && selectedIds.size === dados.length;
        const someSelected = selectedIds.size > 0 && selectedIds.size < dados.length;
        headerCheckboxRef.current.checked = allSelected;
        headerCheckboxRef.current.indeterminate = someSelected;
    }, [selectedIds, dados]);

    const toggleSelectAll = () => {
        if (selectedIds.size === dados.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(dados.map((l) => l.id)));
        }
    };

    const toggleSelectOne = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const selectedCount = selectedIds.size;

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-red-600">🚨 Lotes Vencidos</h2>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                    {total} encontrados
                </span>
            </div>
            <p className="text-gray-500 text-sm">Estes produtos estão vencidos e já foram retirados de circulação.</p>

            {/* Barra de ações em massa — aparece quando há seleções */}
            <div
                className={`flex items-center justify-between gap-2 bg-dark-grey text-green sm:pl-6 sm:pr-10 max-sm:px-3 py-3 rounded-lg shadow-md transition-all duration-300 ${
                    selectedCount > 0
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-2 pointer-events-none h-0 py-0 overflow-hidden"
                }`}
            >
                <span className="text-sm font-semibold">
                    {selectedCount} {selectedCount === 1 ? "lote selecionado" : "lotes selecionados"}
                </span>
                <div className="flex items-center sm:gap-5 gap-3">
                    <button
                        onClick={clearSelection}
                        className="sm:text-sm text-xs underline underline-offset-2 hover:text-red-200 transition-colors cursor-pointer"
                    >
                        Limpar seleção
                    </button>
                    <ExcluirLoteModal
                        loteIds={Array.from(selectedIds)}
                        onRefresh={onRefresh}
                        onSuccess={clearSelection}
                    />
                </div>
            </div>

            <div className="bg-transparent sm:bg-white rounded-lg sm:shadow sm:border sm:border-red-200">
                <table className="w-full text-left border-collapse block sm:table">
                    {/* Cabeçalho some no mobile */}
                    <thead className="hidden sm:table-header-group">
                        <tr className="bg-red-50 text-red-800 border-b border-red-100">
                            {/* Checkbox selecionar todos */}
                            <th className="p-4 w-10">
                                <input
                                    ref={headerCheckboxRef}
                                    type="checkbox"
                                    aria-label="Selecionar todos"
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 accent-red-600 cursor-pointer"
                                />
                            </th>
                            <th className="p-4 font-semibold">Produto</th>
                            <th className="p-4 font-semibold">Validade</th>
                            <th className="p-4 font-semibold text-center">Qtd. Atual</th>
                            <th className="p-4 font-semibold text-center">Status</th>
                            <th className="p-4 font-semibold text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="block sm:table-row-group">
                        {dados.length === 0 ? (
                            <tr className="block sm:table-row bg-white rounded-lg shadow sm:shadow-none p-4 sm:p-0">
                                <td colSpan={6} className="p-8 text-center text-gray-500 italic block sm:table-cell">
                                    Nenhum lote vencido encontrado. Tudo certo! ✅
                                </td>
                            </tr>
                        ) : (
                            dados.map((lote) => {
                                const isSelected = selectedIds.has(lote.id);
                                return (
                                    <tr
                                        key={lote.id}
                                        className={`block sm:table-row bg-white mb-4 sm:mb-0 rounded-lg shadow sm:shadow-none border sm:border-b border-red-100 sm:hover:bg-gray-50 transition-colors ${
                                            isSelected ? "sm:bg-red-50" : ""
                                        }`}
                                    >
                                        {/* CHECKBOX */}
                                        <td className="hidden sm:table-cell p-4 w-10">
                                            <input
                                                type="checkbox"
                                                aria-label={`Selecionar ${lote.produto_nome}`}
                                                checked={isSelected}
                                                onChange={() => toggleSelectOne(lote.id)}
                                                className="w-4 h-4 accent-red-600 cursor-pointer"
                                            />
                                        </td>

                                        {/* PRODUTO */}
                                        <td className="flex justify-between items-center sm:table-cell p-4 font-medium text-gray-800 border-b sm:border-none">
                                            <span className="sm:hidden font-bold text-gray-500 text-sm">Produto:</span>
                                            <span>{lote.produto_nome}</span>
                                        </td>

                                        {/* VALIDADE */}
                                        <td className="flex justify-between items-center sm:table-cell p-4 border-b sm:border-none">
                                            <span className="sm:hidden font-bold text-gray-500 text-sm">Validade:</span>
                                            <span className="text-red-600 font-bold">{formatDate(lote.validade)}</span>
                                        </td>

                                        {/* QUANTIDADE */}
                                        <td className="flex justify-between items-center sm:table-cell p-4 border-b sm:border-none">
                                            <span className="sm:hidden font-bold text-gray-500 text-sm">Quantidade:</span>
                                            <div className="font-mono text-lg text-right sm:text-center">{lote.quantidade}</div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="flex justify-between items-center sm:table-cell p-4 border-b sm:border-none">
                                            <span className="sm:hidden font-bold text-gray-500 text-sm">Status:</span>
                                            <div className="text-right sm:text-center">
                                                <span className="inline-block px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">
                                                    VENCIDO
                                                </span>
                                            </div>
                                        </td>

                                        {/* AÇÕES */}
                                        <td className="flex justify-between items-center sm:table-cell p-4">
                                            <span className="sm:hidden font-bold text-gray-500 text-sm">Ações:</span>
                                            <div className="text-right sm:text-center">
                                                <ExcluirLoteModal loteId={lote.id} onRefresh={onRefresh} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
