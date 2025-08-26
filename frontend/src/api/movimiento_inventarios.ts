import api from './axiosInstance';
import type { MovimientoInventario, PagedResponse } from '../types/index'

export interface GetMovimientoInventariosParams {
    page: number;
    page_size: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    // Filtros
    search?: string;
    tipo?: string;
}

export const getMovimientoInventarios = async (params: GetMovimientoInventariosParams): Promise<PagedResponse<MovimientoInventario>> => {
    // Limpiar parámetros undefined o vacíos antes de enviar
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            cleanParams[key] = value;
        }
    });

    const res = await api.get('inventarios/movimientos', { params: cleanParams });
    return res.data;
};