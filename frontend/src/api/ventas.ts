import api from './axiosInstance';
import type { Venta, PagedResponse } from '../types/index'

export interface GetVentasParams {
    page: number;
    page_size: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    // Filtros
    search?: string;
    estado?: boolean;
}

export const getVentas = async (params: GetVentasParams): Promise<PagedResponse<Venta>> => {
    // Limpiar parámetros undefined o vacíos antes de enviar
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            cleanParams[key] = value;
        }
    });

    const res = await api.get('ventas', { params: cleanParams });
    return res.data;
};

export const toggleEstadoVenta = async (id: number) => {
    const res = await api.patch(`/ventas/${id}/estado`);
    return res.data;
};

export const deleteVenta = async (id: number) => {
    await api.delete(`/ventas/${id}`);
};