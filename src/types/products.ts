export type ProdutoCategoriaType = 'suplementos' | 'alimentos' | 'roupas' | 'acessorios';

export const CATEGORIA_MAP: Record<ProdutoCategoriaType, string> = {
    'suplementos': 'Suplementos',
    'alimentos': 'Alimentos',
    'roupas': 'Roupas',
    'acessorios': 'Acessórios',
};

export interface ProductProps {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  imagem: string;
  porcentagem_desconto: number;
  categoria: ProdutoCategoriaType;
  preco_calculado: number;
  is_favorited: boolean;
  estoque?: number;
  media_avaliacoes?: number;
  total_avaliacoes?: number;
  minha_avaliacao?: number | null;
  distribuicao_avaliacoes?: Record<string, number>;
}

export interface ProductCardProps {
  product: ProductProps;
  onFavoriteChange?: (produtoId: number, isFavorited: boolean) => void;
}

export interface FilterProps {
  produtos: ProductProps[];
  onChange?: (produtosOrdenados: ProductProps[]) => void;
  initialOrdenacao?: string;
  showReset?: boolean;
  extraOptions?: { value: string; label: string }[];
}

export interface ProductContextType {
  produtos: ProductProps[];
  setProdutos: React.Dispatch<React.SetStateAction<ProductProps[]>>;
  loading: boolean;
}
