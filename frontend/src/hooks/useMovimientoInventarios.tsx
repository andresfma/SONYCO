import { useState, useEffect, useCallback } from 'react';
import {
    getMovimientoInventarios,
    type GetMovimientoInventariosParams
} from '../api/movimiento_inventarios';
import type { MovimientoInventario } from '../types'

interface UseMovimientoInventariosParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    // Filtros
    search?: string;
    tipo?: string;
}

interface UseMovimientoInventariosReturn {
    items: MovimientoInventario[];
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useMovimientoInventarios = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    tipo,
}: UseMovimientoInventariosParams): UseMovimientoInventariosReturn => {
    const [items, setItems] = useState<MovimientoInventario[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch movimiento_inventarios con paginación, orden y filtros
    const fetchMovimientoInventarios = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params: GetMovimientoInventariosParams = {
                page,
                page_size: pageSize,
                sort_by: sortBy,
                sort_order: sortOrder,
                search,
                tipo: tipo,
            };

            const response = await getMovimientoInventarios(params);

            setItems(response.items);
            setTotalItems(response.total);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError('Error cargando movimientos');
            console.error('Error:', err);
            // Resetear valores en caso de error
            setItems([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, sortBy, sortOrder, search, tipo]);

    useEffect(() => {
        fetchMovimientoInventarios();
    }, [fetchMovimientoInventarios]);

    return {
        items,
        totalItems,
        totalPages,
        isLoading,
        error,
        refetch: fetchMovimientoInventarios,
    };
};