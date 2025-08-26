import api from "./axiosInstance";
import type { Producto, PagedResponse } from "../types/index";

export interface GetProductosParams {
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  // Filtros
  search?: string;
  categoria?: string;
  estado?: boolean;
}

export const getProductos = async (params: GetProductosParams): Promise<PagedResponse<Producto>> => {
  // Limpiar parámetros undefined o vacíos antes de enviar
  const cleanParams: Record<string, any> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      cleanParams[key] = value;
    }
  });

  const res = await api.get("/productos", { params: cleanParams });
  return res.data;
};

export const toggleEstadoProducto = async (id: number) => {
  const res = await api.patch(`/productos/${id}/estado`);
  return res.data;
};

export const deleteProducto = async (id: number) => {
  await api.delete(`/productos/${id}`);
};