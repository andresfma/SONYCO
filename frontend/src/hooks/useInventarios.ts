import { useState, useEffect, useCallback } from 'react';
import {
    getInventarios,
    toggleEstadoInventario,
    type GetInventariosParams
} from '../api/inventarios';
import type { Inventario } from '../types'

interface UseInventariosParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    // Filtros
    search?: string;
    estado?: boolean;
}

interface UseInventariosReturn {
    items: Inventario[];
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    toggleItemStatus: (id: number) => Promise<void>;
}

export const useInventarios = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    estado
}: UseInventariosParams): UseInventariosReturn => {
    const [items, setItems] = useState<Inventario[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch inventarios con paginación, orden y filtros
    const fetchInventarios = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params: GetInventariosParams = {
                page,
                page_size: pageSize,
                sort_by: sortBy,
                sort_order: sortOrder,
                search,
                estado
            };

            const response = await getInventarios(params);

            setItems(response.items);
            setTotalItems(response.total);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError('Error cargando inventarios');
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
        fetchInventarios();
    }, [fetchInventarios]);

    // Toggle estado del inventario
    const toggleItemStatus = async (id: number) => {
        try {
            await toggleEstadoInventario(id);
            await fetchInventarios();
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            throw new Error('Error al cambiar estado del inventario');
        }
    };

    return {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
        refetch: fetchInventarios,
        toggleItemStatus
    };
};