import api from "./axiosInstance";
import type { Inventario, PagedResponse } from "../types";

export const getTotalProductos = async () => {
  const response = await api.get("/productos/total");
  return response.data; // se espera: { total: number }
};

export const getVentasDelMes = async () => {
  const response = await api.get("/ventas/30dias");
  return response.data; // se espera: { total: number }
};

export const getTotalClientesVentas = async () => {
  const response = await api.get("clientes/con-ventas");
  return response.data; // se espera: { total: number }
}

// Función actualizada para manejar paginación y ordenamiento del lado del servidor
export const getProductosConStockBajo = async (params: {
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}): Promise<PagedResponse<Inventario>> => {
  const response = await api.get("/inventarios/stock-bajo", { params });
  return response.data;
};