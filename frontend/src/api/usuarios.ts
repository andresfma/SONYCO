import api from './axiosInstance';
import type { Usuario, PagedResponse } from '../types/index'

export interface GetUsuariosParams {
    page: number;
    page_size: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    // Filtros
    search?: string;
    estado?: boolean;
}

export const getUsuarios = async (params: GetUsuariosParams): Promise<PagedResponse<Usuario>> => {
    // Limpiar parámetros undefined o vacíos antes de enviar
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            cleanParams[key] = value;
        }
    });

    const res = await api.get('usuarios', { params: cleanParams });
    return res.data;
};

export const toggleEstadoUsuario = async (id: number) => {
    const res = await api.patch(`/usuarios/${id}/estado`);
    return res.data;
};

export const deleteUsuario = async (id: number) => {
    await api.delete(`/usuarios/${id}`);
};