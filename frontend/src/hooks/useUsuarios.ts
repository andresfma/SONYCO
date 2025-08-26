import { useState, useEffect, useCallback } from 'react';
import {
    getUsuarios,
    toggleEstadoUsuario,
    deleteUsuario,
    type GetUsuariosParams
} from '../api/usuarios';
import type { Usuario } from '../types'

interface UseUsuariosParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    // Filtros
    search?: string;
    estado?: boolean;
}

interface UseUsuariosReturn {
    items: Usuario[];
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    toggleItemStatus: (id: number) => Promise<void>;
    deleteItem: (id: number) => Promise<void>;
}

export const useUsuarios = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    estado
}: UseUsuariosParams): UseUsuariosReturn => {
    const [items, setItems] = useState<Usuario[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch usuarios con paginación, orden y filtros
    const fetchUsuarios = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params: GetUsuariosParams = {
                page,
                page_size: pageSize,
                sort_by: sortBy,
                sort_order: sortOrder,
                search,
                estado
            };

            const response = await getUsuarios(params);

            setItems(response.items);
            setTotalItems(response.total);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError('Error cargando usuarios');
            console.error('Error:', err);
            // Resetear valores en caso de error
            setItems([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, sortBy, sortOrder, search, estado]);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    // Toggle estado del usuario
    const toggleItemStatus = async (id: number) => {
        try {
            await toggleEstadoUsuario(id);
            await fetchUsuarios();
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            throw new Error('Error al cambiar estado del usuario');
        }
    };

    // Eliminar usuario
    const deleteItem = async (id: number) => {
        try {
            await deleteUsuario(id);
            await fetchUsuarios();
        } catch (err: any) {
            console.error('Error al eliminar el usuario:', err);
            if (err.response?.status === 400) {
                throw new Error('No se puede elimiar: tiene relaciones activas.\n Se recomienda desactivar el ítem');
            } else {
                throw new Error('Error al eliminar producto');
            }
        }
    };

    return {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
        refetch: fetchUsuarios,
        toggleItemStatus,
        deleteItem
    };
};