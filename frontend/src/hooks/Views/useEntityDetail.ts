import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosInstance';

interface UseEntityDetailParams {
  entityType: string; // 'productos', 'clientes', etc.
  entityId: string | number;
  enabled?: boolean; // Para controlar cuándo hacer la petición
}

interface UseEntityDetailReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Función helper para transformar datos específicos de usuarios
const transformUsuarioData = (rawData: any) => {
  const rolMap: Record<number, string> = {
    1: 'Admin',
    2: 'Usuario'
  };

  return {
    ...rawData,
    rol: rolMap[rawData.rol_id] || 'Desconocido'
  };
};

// Función principal de transformación que puede expandirse para otras entidades
const transformEntityData = (entityType: string, rawData: any) => {
  switch (entityType) {
    case 'usuarios':
      return transformUsuarioData(rawData);
    
    default:
      return rawData;
  }
};

export const useEntityDetail = <T>({
  entityType,
  entityId,
  enabled = true
}: UseEntityDetailParams): UseEntityDetailReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch entity detail
  const fetchEntityDetail = useCallback(async () => {
    if (!enabled || !entityId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/${entityType}/${entityId}`);
      
      // Aplicar transformación específica según el tipo de entidad
      const transformedData = transformEntityData(entityType, response.data);
      
      setData(transformedData);
    } catch (err: any) {
      console.error(`Error fetching ${entityType} detail:`, err);
      
      if (err.response?.status === 404) {
        setError(`${entityType.slice(0, -1)} no encontrado`);
      } else {
        setError(`Error cargando detalles del ${entityType.slice(0, -1)}`);
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId, enabled]);

  useEffect(() => {
    fetchEntityDetail();
  }, [fetchEntityDetail]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchEntityDetail
  };
};