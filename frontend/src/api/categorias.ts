import api from './axiosInstance';
import type { Categoria, PagedResponse } from '../types/index'

export interface GetCategoriasParams {
    page: number;
    page_size: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    // Filtros
    search?: string;
    estado?: boolean;
}

export const getCategorias = async (params: GetCategoriasParams): Promise<PagedResponse<Categoria>> => {
    // Limpiar parámetros undefined o vacíos antes de enviar
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            cleanParams[key] = value;
        }
    });

    const res = await api.get('categorias', { params: cleanParams });
    return res.data;
};

export const toggleEstadoCategoria = async (id: number) => {
    const res = await api.patch(`/categorias/${id}/estado`);
    return res.data;
};

export const deleteCategoria = async (id: number) => {
    await api.delete(`/categorias/${id}`);
};