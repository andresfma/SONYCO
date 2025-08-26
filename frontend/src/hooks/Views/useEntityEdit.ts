import { useState, useCallback } from 'react';
import api from '../../api/axiosInstance';

interface UseEntityEditParams {
  entityType: string;
}

interface UseEntityEditReturn<T> {
  isLoading: boolean;
  error: string | null;
  updateEntity: (id: number | string, data: Partial<T>) => Promise<T>;
}

export const useEntityEdit = <T>({
  entityType
}: UseEntityEditParams): UseEntityEditReturn<T> => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEntity = useCallback(async (id: number | string, data: Partial<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      // Limpiar campos undefined o vacíos
      const cleanData: Record<string, any> = {};
      
      Object.entries(data as Record<string, any>).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          cleanData[key] = value;
        }
      });

      const response = await api.patch(`/${entityType}/${id}`, cleanData);
      return response.data;
    } catch (err: any) {
      console.error(`Error updating ${entityType}:`, err);
      
      if (err.response?.status === 404) {
        setError(`${entityType.slice(0, -1)} no encontrado`);
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.detail || 'Datos inválidos');
      } else {
        setError(`Error actualizando ${entityType.slice(0, -1)}`);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [entityType]);

  return {
    isLoading,
    error,
    updateEntity
  };
};