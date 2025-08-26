import api from './axiosInstance';
import type { Inventario, PagedResponse } from '../types/index'

export interface GetInventariosParams {
    page: number;
    page_size: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    // Filtros
    search?: string;
    tipo_persona?: string;
    estado?: boolean;
}

export const getInventarios = async (params: GetInventariosParams): Promise<PagedResponse<Inventario>> => {
    // Limpiar parámetros undefined o vacíos antes de enviar
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            cleanParams[key] = value;
        }
    });

    const res = await api.get('inventarios', { params: cleanParams });
    return res.data;
};

export const toggleEstadoInventario = async (id: number) => {
    const res = await api.patch(`/inventarios/${id}/estado`);
    return res.data;
};