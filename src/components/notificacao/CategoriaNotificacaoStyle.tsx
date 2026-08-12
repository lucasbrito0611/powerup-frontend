import React from 'react';
import { Package, RefreshCw, Mail, Tag, ShieldAlert } from 'lucide-react';
import Icon from '../Icon';

export interface CategoriaConfigItem {
    icon: React.ReactNode;
    badgeStyle: string;
    label: string;
}

export const CATEGORIA_NOTIFICACAO_CONFIG: Record<string, CategoriaConfigItem> = {
    'status_pedido': {
        icon: <Package size={20} className="text-light-green" />,
        badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Status do Pedido',
    },
    'status_devolucao': {
        icon: <RefreshCw size={20} className="text-light-green" />,
        badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
        label: 'Status da Devolução',
    },
    'promocao': {
        icon: <Tag size={20} className="text-light-green" />,
        badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Promoção',
    },
    'seguranca': {
        icon: <ShieldAlert size={20} className="text-light-green" />,
        badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'Segurança',
    },
    'mensagem_personalizada': {
        icon: <Mail size={20} className="text-light-green" />,
        badgeStyle: 'bg-gray-50 text-gray-700 border-gray-200',
        label: 'Mensagem Geral',
    },
};

interface CategoriaNotificacaoStyleProps {
    categoria: string;
    showLabel?: boolean;
}

export default function CategoriaNotificacaoStyle({ categoria, showLabel = false }: CategoriaNotificacaoStyleProps) {
    const config = CATEGORIA_NOTIFICACAO_CONFIG[categoria] || CATEGORIA_NOTIFICACAO_CONFIG['mensagem_personalizada'];

    if (showLabel) {
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.badgeStyle}`}>
                {config.label}
            </span>
        );
    }

    return <Icon icon={config.icon} />;
}
