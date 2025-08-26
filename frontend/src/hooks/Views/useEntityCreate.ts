import { useState, useCallback } from 'react';
import api from '../../api/axiosInstance';

interface UseEntityCreateParams {
  entityType: string;
}

interface UseEntityCreateReturn<T> {
  isLoading: boolean;
  error: string | null;
  createEntity: (data: Omit<T, 'id'>) => Promise<T>;
}

export const useEntityCreate = <T>({
  entityType
}: UseEntityCreateParams): UseEntityCreateReturn<T> => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEntity = useCallback(async (data: Omit<T, 'id'>): Promise<T> => {
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

      const response = await api.post(`/${entityType}/`, cleanData);
      return response.data;
    } catch (err: any) {
      console.error(`Error creating ${entityType}:`, err);
      
      if (err.response?.status === 400) {
        setError(err.response?.data?.detail || 'Datos inválidos');
      } else if (err.response?.status === 409) {
        setError('Ya existe un registro con estos datos');
      } else {
        setError(`Error creando ${entityType.slice(0, -1)}`);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [entityType]);

  return {
    isLoading,
    error,
    createEntity
  };
};