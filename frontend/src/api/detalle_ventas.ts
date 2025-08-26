import api from './axiosInstance';
import type { DetalleVenta, PagedResponse } from '../types/index'

export interface GetDetalleVentasParams {
    page: number;
    page_size: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    // Filtros
    search?: string;
}

export const getDetalleVentas = async (id: number, params: GetDetalleVentasParams): Promise<PagedResponse<DetalleVenta>> => {
    // Limpiar parámetros undefined o vacíos antes de enviar
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            cleanParams[key] = value;
        }
    });

    const res = await api.get(`ventas/detalles/${id}`, { params: cleanParams });
    return res.data;
};


export const deleteDetalleVenta = async (id: number) => {
  await api.delete(`/detalle_venta/${id}`);
};