import { useState, useEffect, useCallback } from 'react';
import {
    getCategorias,
    toggleEstadoCategoria,
    deleteCategoria,
    type GetCategoriasParams
} from '../api/categorias';
import type { Categoria } from '../types'

interface UseCategoriasParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    // Filtros
    search?: string;
    estado?: boolean;
}

interface UseCategoriasReturn {
    items: Categoria[];
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    toggleItemStatus: (id: number) => Promise<void>;
    deleteItem: (id: number) => Promise<void>;
}

export const useCategorias = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    estado
}: UseCategoriasParams): UseCategoriasReturn => {
    const [items, setItems] = useState<Categoria[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch categorias con paginación, orden y filtros
    const fetchCategorias = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params: GetCategoriasParams = {
                page,
                page_size: pageSize,
                sort_by: sortBy,
                sort_order: sortOrder,
                search,
                estado
            };

            const response = await getCategorias(params);

            setItems(response.items);
            setTotalItems(response.total);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError('Error cargando categorias');
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
        fetchCategorias();
    }, [fetchCategorias]);

    // Toggle estado del categoria
    const toggleItemStatus = async (id: number) => {
        try {
            await toggleEstadoCategoria(id);
            await fetchCategorias();
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            throw new Error('Error al cambiar estado del categoria');
        }
    };

    // Eliminar categoria
    const deleteItem = async (id: number) => {
        try {
            await deleteCategoria(id);
            await fetchCategorias();
        } catch (err: any) {
            console.error('Error al eliminar el categoria:', err);
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
        refetch: fetchCategorias,
        toggleItemStatus,
        deleteItem
    };
};