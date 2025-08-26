import api from './axiosInstance';
import type { Cliente, PagedResponse } from '../types/index'

export interface GetClientesParams {
    page: number;
    page_size: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    // Filtros
    search?: string;
    tipo_persona?: string;
    estado?: boolean;
}

export const getClientes = async (params: GetClientesParams): Promise<PagedResponse<Cliente>> => {
    // Limpiar parámetros undefined o vacíos antes de enviar
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            cleanParams[key] = value;
        }
    });

    const res = await api.get('clientes', { params: cleanParams });
    return res.data;
};

export const toggleEstadoCliente = async (id: number) => {
    const res = await api.patch(`/clientes/${id}/estado`);
    return res.data;
};

export const deleteCliente = async (id: number) => {
    await api.delete(`/clientes/${id}`);
};