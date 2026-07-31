export type DevolucaoStatusType = '1' | '2' | '3' | '4' | '5';
export const DEVOLUCAO_STATUS_MAP: Record<DevolucaoStatusType, string> = {
    '1': 'Pendente',
    '2': 'Aprovada',
    '3': 'Reembolsado',
    '4': 'Recusada',
    '5': 'Cancelada',
};

export interface ItemDevolvidoProps {
    id: number;
    pedido_item: number;
    produto_nome: string;
    quantidade: number;
}

export interface DevolucaoProps {
    id: number;
    pedido_id: number;
    user_nome: string;
    status: DevolucaoStatusType;
    status_display: string;
    motivo: string;
    arquivo: string | null; 
    data_solicitacao: string; 
    itens: ItemDevolvidoProps[]; 
    total: number;
}

export interface CancelarDevolucaoProps {
    devolucaoId?: number;
    onCancelSuccess: (devolucaoId: number) => void; 
}

// ─── Interfaces para os modais do painel administrativo ───────────────────────
export interface AdminDetalhesDevolucaoModalProps {
    devolucao: DevolucaoProps;
}

export interface AdminEditDevolucaoModalProps {
    devolucao: DevolucaoProps;
    className?: string;
}

export interface AdminExcluirDevolucaoModalProps {
    devolucaoId: number;
    className?: string;
}