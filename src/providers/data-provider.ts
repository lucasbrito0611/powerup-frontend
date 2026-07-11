"use client";

import dataProviderSimpleRest from "@refinedev/simple-rest";
import api from "@/services/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const baseProvider = dataProviderSimpleRest(API_URL, api);

export const dataProvider = {
  ...baseProvider,
  
  getList: async (params: any) => {
    try {
      const { resource } = params;
      const url = `/${resource}/`;
      
      const { data } = await api.get(url);
      
      return {
        data: data,
        total: data.length,
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
