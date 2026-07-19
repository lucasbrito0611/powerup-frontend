export interface Lote {
    id: number;
    produto_nome: string;
    validade: string;
    quantidade: number;
}

export interface LotesVencidosProps {
    dados: Lote[];
    total: number;
    onRefresh?: () => void;
}

export interface LotesProximosProps {
    dados: Lote[];
    total: number;
}

export interface ExcluirLoteModalProps {
    loteId?: number;
    loteIds?: number[];
    onRefresh?: () => void;
    onSuccess?: () => void;
}

export interface DashboardData {
    resumo: {
        total_vencidos: number;
        total_proximos: number;
    };
    vencidos: Lote[];
    proximos_vencimento: Lote[];
}