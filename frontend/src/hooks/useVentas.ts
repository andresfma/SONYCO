import { useState, useEffect, useCallback } from 'react';
import {
    getVentas,
    toggleEstadoVenta,
    deleteVenta,
    type GetVentasParams
} from '../api/ventas';
import type { Venta } from '../types'

interface UseVentasParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    // Filtros
    search?: string;
    estado?: boolean;
}

interface UseVentasReturn {
    items: Venta[];
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    toggleItemStatus: (id: number) => Promise<void>;
    deleteItem: (id: number) => Promise<void>;
}

export const useVentas = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    estado
}: UseVentasParams): UseVentasReturn => {
    const [items, setItems] = useState<Venta[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch ventas con paginación, orden y filtros
    const fetchVentas = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params: GetVentasParams = {
                page,
                page_size: pageSize,
                sort_by: sortBy,
                sort_order: sortOrder,
                search,
                estado
            };

            const response = await getVentas(params);

            setItems(response.items);
            setTotalItems(response.total);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError('Error cargando ventas');
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
        fetchVentas();
    }, [fetchVentas]);

    // Toggle estado del venta
    const toggleItemStatus = async (id: number) => {
        try {
            await toggleEstadoVenta(id);
            await fetchVentas();
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            throw new Error('Error al cambiar estado del venta');
        }
    };

    // Eliminar venta
    const deleteItem = async (id: number) => {
        try {
            await deleteVenta(id);
            await fetchVentas();
        } catch (err: any) {
            console.error('Error al eliminar el venta:', err);
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
        refetch: fetchVentas,
        toggleItemStatus,
        deleteItem
    };
};