import { useState, useEffect, useCallback } from 'react';
import {
    getClientes,
    toggleEstadoCliente,
    deleteCliente,
    type GetClientesParams
} from '../api/clientes';
import type { Cliente } from '../types'

interface UseClientesParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    // Filtros
    search?: string;
    tipoPersona?: string;
    estado?: boolean;
}

interface UseClientesReturn {
    items: Cliente[];
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    toggleItemStatus: (id: number) => Promise<void>;
    deleteItem: (id: number) => Promise<void>;
}

export const useClientes = ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    tipoPersona,
    estado
}: UseClientesParams): UseClientesReturn => {
    const [items, setItems] = useState<Cliente[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch clientes con paginación, orden y filtros
    const fetchClientes = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params: GetClientesParams = {
                page,
                page_size: pageSize,
                sort_by: sortBy,
                sort_order: sortOrder,
                search,
                tipo_persona: tipoPersona,
                estado
            };

            const response = await getClientes(params);

            setItems(response.items);
            setTotalItems(response.total);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError('Error cargando clientes');
            console.error('Error:', err);
            // Resetear valores en caso de error
            setItems([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, sortBy, sortOrder, search, tipoPersona, estado]);

    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    // Toggle estado del cliente
    const toggleItemStatus = async (id: number) => {
        try {
            await toggleEstadoCliente(id);
            await fetchClientes();
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            throw new Error('Error al cambiar estado del cliente');
        }
    };

    // Eliminar cliente
    const deleteItem = async (id: number) => {
        try {
            await deleteCliente(id);
            await fetchClientes();
        } catch (err: any) {
            console.error('Error al eliminar el cliente:', err);
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
        refetch: fetchClientes,
        toggleItemStatus,
        deleteItem
    };
};