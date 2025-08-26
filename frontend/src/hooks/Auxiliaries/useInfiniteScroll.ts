import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axiosInstance';

export interface InfiniteScrollItem {
  id: number;
  nombre: string;
}

interface UseInfiniteScrollParams {
  endpoint: string; // 'categorias/infinita', 'clientes/infinito', etc.
  limit?: number;
  enabled?: boolean;
  searchTerm?: string;
  debounceMs?: number; // Tiempo de debounce para búsqueda
}

interface UseInfiniteScrollReturn {
  items: InfiniteScrollItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
}

export const useInfiniteScroll = ({
  endpoint,
  limit = 50,
  enabled = true,
  searchTerm = '',
  debounceMs = 500
}: UseInfiniteScrollParams): UseInfiniteScrollReturn => {
  const [items, setItems] = useState<InfiniteScrollItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const isFirstLoad = useRef(true);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce del searchTerm
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Si es la primera carga o no hay término de búsqueda, aplicar inmediatamente
    if (isFirstLoad.current || searchTerm === '') {
      setDebouncedSearchTerm(searchTerm);
      return;
    }

    // Para búsquedas, aplicar debounce
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, debounceMs]);

  // Función para cargar items
  const loadItems = useCallback(async (currentSkip: number, isLoadingMore = false) => {
    if (!enabled) return;

    if (isLoadingMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    
    setError(null);

    try {
      const params: Record<string, any> = {
        skip: currentSkip,
        limit
      };

      // Agregar búsqueda si existe
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }

      const response = await api.get(`/${endpoint}`, { params });
      const newItems: InfiniteScrollItem[] = response.data;

      if (currentSkip === 0) {
        // Primera carga o reset
        setItems(newItems);
      } else {
        // Cargar más items
        setItems(prevItems => [...prevItems, ...newItems]);
      }

      // Verificar si hay más items
      setHasMore(newItems.length === limit);
      setSkip(currentSkip + newItems.length);

    } catch (err: any) {
      console.error(`Error loading ${endpoint}:`, err);
      setError(`Error cargando datos`);
      
      if (currentSkip === 0) {
        setItems([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [endpoint, limit, enabled, debouncedSearchTerm]);

  // Cargar más items
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadItems(skip, true);
    }
  }, [loadItems, skip, isLoadingMore, hasMore]);

  // Reset para búsquedas
  const reset = useCallback(() => {
    setItems([]);
    setSkip(0);
    setHasMore(true);
    setError(null);
  }, []);

  // Efecto para carga inicial y búsquedas con debounce
  useEffect(() => {
    if (enabled) {
      if (isFirstLoad.current) {
        // Primera carga: cargar datos iniciales
        loadItems(0);
        isFirstLoad.current = false;
      } else {
        // Búsqueda: reset y cargar desde el inicio
        reset();
        loadItems(0);
      }
    }
  }, [loadItems, enabled, debouncedSearchTerm, reset]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    reset
  };
};