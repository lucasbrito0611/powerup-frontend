"use client";

import dataProviderSimpleRest from "@refinedev/simple-rest";
import api from "@/services/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const baseProvider = dataProviderSimpleRest(API_URL, api);

export const dataProvider = {
  ...baseProvider,
  
  getList: async (params: any) => {
    try {
      const { resource, pagination, filters, sorters } = params;
      const url = `/${resource}/`;
      
      const query = new URLSearchParams();

      // Paginação
      if (pagination && pagination.mode !== "off") {
        if (pagination.current) {
          query.append("page", pagination.current.toString());
        }
        if (pagination.pageSize) {
          query.append("page_size", pagination.pageSize.toString());
        }
      }

      // Ordenação
      if (sorters && sorters.length > 0) {
        const orderParam = sorters.map((s: any) => {
          return s.order === "desc" ? `-${s.field}` : s.field;
        }).join(",");
        query.append("ordering", orderParam);
      }

      // Busca (Filtro Global)
      if (filters && filters.length > 0) {
        const searchFilter = filters.find((f: any) => f.field === "search" || f.field === "q");
        if (searchFilter && searchFilter.value) {
          query.append("search", searchFilter.value);
        }
      }
      
      const endpoint = query.toString() ? `${url}?${query.toString()}` : url;
      const { data } = await api.get(endpoint);
      
      const isPaginated = data && data.results !== undefined;
      
      return {
        data: isPaginated ? data.results : data,
        total: isPaginated ? data.count : data.length,
      };
    } catch (error) {
      console.error(`Erro no getList do Refine para ${params.resource}`, error);
      throw error;
    }
  },

  getOne: async (params: any) => {
    const { resource, id } = params;
    const url = `/${resource}/${id}/`;
     
    const { data } = await api.get(url);
    return { data };
  }
};
