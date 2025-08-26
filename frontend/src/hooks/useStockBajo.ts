import { useState, useEffect } from "react";
import { getProductosConStockBajo } from "../api/dashboard";
import type { Inventario } from "../types/index";

interface UseStockBajoParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

interface UseStockBajoReturn {
  items: Inventario[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

export const useStockBajo = ({
  page,
  pageSize,
  sortBy,
  sortOrder,
  search
}: UseStockBajoParams): UseStockBajoReturn => {
  const [items, setItems] = useState<Inventario[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockBajo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Llamada a la API con parámetros de paginación, ordenamiento y búsqueda
        const response = await getProductosConStockBajo({
          page,
          page_size: pageSize,
          sort_by: sortBy,
          sort_order: sortOrder,
          search: search
        });

        // La respuesta ya viene paginada del servidor
        setItems(response.items);
        setTotalItems(response.total);
        setTotalPages(response.total_pages);
      } catch (err) {
        setError('Error al cargar productos con stock bajo');
        console.error('Error:', err);
        // Resetear valores en caso de error
        setItems([]);
        setTotalItems(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockBajo();
  }, [page, pageSize, sortBy, sortOrder, search]);

  return {
    items,
    totalItems,
    totalPages,
    isLoading,
    error
  };
};