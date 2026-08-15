import { 
  DataProvider, 
  CrudFilters, 
  CrudSorting, 
  Pagination 
} from "@refinedev/core";
import dataProviderSimpleRest from "@refinedev/simple-rest";
import api from "@/services/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const baseProvider = dataProviderSimpleRest(API_URL, api);

export const dataProvider: DataProvider = {
  ...baseProvider,
  
  getList: async ({ resource, pagination, filters, sorters }: {
    resource: string;
    pagination?: Pagination;
    filters?: CrudFilters;
    sorters?: CrudSorting;
  }) => {
    try {
      // Mapeamento de recursos com rotas não-convencionais
      const RESOURCE_URL_MAP: Record<string, string> = {
        notificacoes_admin: '/notificacoes/admin/',
      };
      const url = RESOURCE_URL_MAP[resource] ?? `/${resource}/`;
      
      const query = new URLSearchParams();

      // Paginação
      if (pagination && pagination.mode !== "off") {
        if (pagination.currentPage) {
          query.append("page", pagination.currentPage.toString());
        }
        if (pagination.pageSize) {
          query.append("page_size", pagination.pageSize.toString());
        }
      }

      // Ordenação
      if (sorters && sorters.length > 0) {
        const orderParam = sorters.map((s) => {
          return s.order === "desc" ? `-${s.field}` : s.field;
        }).join(",");
        query.append("ordering", orderParam);
      }

      // Busca e Filtros Exatos
      if (filters && filters.length > 0) {
        filters.forEach((f) => {
          if ('field' in f) {
            if (f.field === "search" || f.field === "q") {
              query.append("search", String(f.value));
            } else if (f.operator === "eq") {
              query.append(f.field, String(f.value));
            }
          }
        });
      }
      
      const endpoint = query.toString() ? `${url}?${query.toString()}` : url;
      const { data } = await api.get(endpoint);
      
      const isPaginated = data && data.results !== undefined;
      
      return {
        data: isPaginated ? data.results : data,
        total: isPaginated ? data.count : data.length,
      };
    } catch (error) {
      console.error(`Erro no getList do Refine para ${resource}`, error);
      throw error;
    }
  },

  getOne: async ({ resource, id }) => {
    const url = `/${resource}/${id}/`;
    const { data } = await api.get(url);
    return { data };
  },

  create: async ({ resource, variables }) => {
    const url = `/${resource}/`;

    // Se for FormData (ex: upload de imagem), usa multipart; senão, JSON normal
    const isFormData = variables instanceof FormData;
    const { data } = await api.post(url, variables, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : undefined);
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const url = `/${resource}/${id}/`;
    
    // Se for FormData (ex: upload de imagem), usa multipart; senão, JSON normal
    const isFormData = variables instanceof FormData;
    const { data } = await api.patch(url, variables, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : undefined);
    return { data };
  },

  deleteOne: async ({ resource, id, variables }) => {
    const url = `/${resource}/${id}/`;
    
    const { data } = await api.delete(url, { data: variables });
    return { data };
  },

  getApiUrl: () => API_URL,
};
