import { useState, useEffect, useCallback } from 'react';
import {
  getDetalleVentas,
  deleteDetalleVenta,
  type GetDetalleVentasParams,
} from '../api/detalle_ventas';
import type { DetalleVenta } from '../types';

interface UseDetalleVentasParams {
  ventaId: number;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

interface UseDetalleVentasReturn {
  items: DetalleVenta[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
}

export const useDetalleVentas = ({
  ventaId,
  page,
  pageSize,
  sortBy,
  sortOrder,
  search,
}: UseDetalleVentasParams): UseDetalleVentasReturn => {
  const [items, setItems] = useState<DetalleVenta[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetalleVentas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: GetDetalleVentasParams = {
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        search,
      };

      const response = await getDetalleVentas(ventaId, params);

      setItems(response.items);
      setTotalItems(response.total);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError('Error cargando detalle_ventas');
      console.error('Error:', err);
      setItems([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [ventaId, page, pageSize, sortBy, sortOrder, search]);

  useEffect(() => {
    fetchDetalleVentas();
  }, [fetchDetalleVentas]);

  const deleteItem = async (id: number) => {
    try {
      await deleteDetalleVenta(id);
      await fetchDetalleVentas();
    } catch (err: any) {
      console.error('Error al eliminar detalle_venta:', err);
      if (err.response?.status === 400) {
        throw new Error('No se puede eliminar: tiene relaciones activas.\n Se recomienda desactivar el ítem.');
      } else {
        throw new Error('Error al eliminar detalle_venta');
      }
    }
  };

  return {
    items,
    totalItems,
    totalPages,
    isLoading,
    error,
    refetch: fetchDetalleVentas,
    deleteItem,
  };
};
