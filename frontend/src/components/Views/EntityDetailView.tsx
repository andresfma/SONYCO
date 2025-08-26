import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntityDetail } from '../../hooks/Views/useEntityDetail';
import { formatDateLocal } from '../../utils/dateUtils';

// Tipos para definir cómo mostrar los campos
export interface DetailField {
  key: string;
  label: string;
  type?: 'text' | 'currency' | 'boolean' | 'nested' | 'date';
  render?: (value: any, item: any) => React.ReactNode;
  nestedFields?: DetailField[]; // Para objetos anidados como categoria
}

export interface EntityDetailViewProps {
  entityType: string;
  entityId: string | number;
  title: string;
  subtitle?: string;
  fields: DetailField[];
  backButtonLabel?: string;
  backPath?: string;
  actions?: React.ReactNode; // Botones adicionales como "Editar"
  className?: string;
}

export function EntityDetailView<T>({
  entityType,
  entityId,
  title,
  subtitle,
  fields,
  backButtonLabel = "Volver",
  backPath,
  actions,
  className = ""
}: EntityDetailViewProps) {
  const navigate = useNavigate();
  const { data, isLoading, error } = useEntityDetail<T>({
    entityType,
    entityId
  });

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const renderField = (field: DetailField, value: any, fullItem: any): React.ReactNode => {
    if (field.render) {
      return field.render(value, fullItem);
    }

    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    switch (field.type) {
      case 'currency':
        return (
          <span>
            $ {Number(value)
              .toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
            }
          </span>
        );

      case 'boolean':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}>
            {value ? 'Activo' : 'Inactivo'}
          </span>
        );

      case 'date':
        if (value) {
          return <span>{formatDateLocal(value)}</span>;
        }
        return <span className="text-gray-400">-</span>;

      case 'nested':
        if (value && typeof value === 'object' && field.nestedFields) {
          return (
            <div className="space-y-2">
              {field.nestedFields.map((nestedField) => {
                const nestedValue = value[nestedField.key];
                return (
                  <div key={nestedField.key} className="flex">
                    <span className="text-sm text-gray-600 min-w-[80px]">
                      {nestedField.label}:
                    </span>
                    <span className="text-sm ml-2">
                      {renderField(nestedField, nestedValue, value)}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }
        return <span className="text-gray-400">-</span>;

      case 'text':
      default: {
        const tipos: Record<string | number, string> = {
          natural: 'Natural',
          juridica: 'Jurídica'
        };

        return <span>{tipos[value] || String(value)}</span>;
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            {backButtonLabel}
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No se encontraron datos</p>
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            {backButtonLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      {/* Header */}
      <div className='pb-2'>
        <div className="mb-2">
          <button
            onClick={handleBack}
            className="text-blue hover:text-blue_hover font-medium transition-colors"
          >
            ← {backButtonLabel}
          </button>
        </div>

        {/* Div para title, subtitle y actions */}
        <div className="flex justify-between items-center mb-8 ">
          <div>
            <h1 className="text-2xl font-semibold text-cl_font_main">
              {title}
            </h1>
            {subtitle && (
              <p className="text-cl_font_sec mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="space-x-4">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-app border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-6">
          {fields.map((field) => {
            // Extraer la key real del objeto si es un campo de producto
            const actualKey = field.key.startsWith('producto_') ? 'producto' : field.key;
            const value = (data as any)[actualKey];
            return (
              <div key={field.key} className="space-y-1">
                <label className="block font-medium text-gray-500">
                  {field.label}
                </label>
                <div className="text-gray-900 border-b border-gray-200 pb-1">
                  {renderField(field, value, data)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}