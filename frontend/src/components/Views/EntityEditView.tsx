import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntityDetail } from '../../hooks/Views/useEntityDetail';
import { useEntityEdit } from '../../hooks/Views/useEntityEdit';
import { InfiniteScrollSelect } from '../Auxiliaries/InfiniteScrollSelect';
import { useNotificationHelpers } from '../../hooks/Auxiliaries/useNotificationHelpers';

// Tipos para definir cómo editar los campos
export interface EditField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select' | 'infiniteSelect' | 'boolean' | 'password' | 'display';
  required?: boolean;
  placeholder?: string;
  validation?: (value: any) => string | null;
  // Para select infinito (FK)
  infiniteEndpoint?: string; // 'categorias/infinita'
  // Para select normal
  options?: { value: any; label: string }[];
  // Para campo password
  confirmField?: string; // Key del campo de confirmación
  // Para campo display
  displayValue?: (data: any) => string; // Función para formatear el valor a mostrar
  displayPath?: string; // Ruta anidada al valor (ej: 'producto.nombre')
}

export interface EntityEditViewProps {
  entityType: string;
  entityId: string | number;
  title: string;
  subtitle?: string;
  fields: EditField[];
  backPath?: string;
  detailPath?: string; // Ruta a la que redirigir después de editar
  className?: string;
}

export function EntityEditView<T>({
  entityType,
  entityId,
  title,
  subtitle,
  fields,
  backPath,
  detailPath,
  className = ""
}: EntityEditViewProps) {
  const navigate = useNavigate();

  const { notifyEntityUpdated, notifyEntityError } = useNotificationHelpers();

  // Hooks para cargar y editar datos
  const { data, isLoading: isLoadingData, error: loadError } = useEntityDetail<T>({
    entityType,
    entityId
  });

  const { isLoading: isUpdating, error: updateError, updateEntity } = useEntityEdit<T>({
    entityType
  });

  // Estado del formulario
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Función helper para obtener valor anidado
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Inicializar formulario cuando se cargan los datos
  useEffect(() => {
    if (data) {
      const initialData: Record<string, any> = {};

      fields.forEach(field => {
        // Los campos display no se incluyen en formData ya que no son editables
        if (field.type === 'display') return;

        const value = (data as any)[field.key];

        if (field.type === 'infiniteSelect') {
          // Para campos FK, extraer solo el ID
          const fkKey = field.key.replace('_id', ''); // categoria_id -> categoria
          const relatedObject = (data as any)[fkKey];
          initialData[field.key] = relatedObject ? relatedObject.id : value;
        } else if (field.type === 'password') {
          // Para campos password, inicializar vacío (no mostrar la contraseña actual)
          initialData[field.key] = '';
        } else {
          initialData[field.key] = value ?? '';
        }
      });

      setFormData(initialData);
    }
  }, [data, fields]);

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);

    // Limpiar error del campo si existe
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    // Si es un campo password con confirmación, limpiar también el error de confirmación
    const field = fields.find(f => f.key === key);
    if (field?.type === 'password' && field.confirmField) {
      const confirmFieldKey = field.confirmField;
      if (errors[confirmFieldKey]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[confirmFieldKey];
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      // Los campos display no se validan
      if (field.type === 'display') return;

      const value = formData[field.key];

      // Para campos password, solo validar si se ingresó algo
      if (field.type === 'password') {
        // Si el campo no es requerido y está vacío, no validar
        if (!field.required && (value === undefined || value === null || value === '')) {
          return;
        }
        // Si el campo es requerido y está vacío, marcar error
        if (field.required && (value === undefined || value === null || value === '')) {
          newErrors[field.key] = `${field.label} es requerido`;
          return;
        }
      } else {
        // Validación requerido para otros tipos
        if (field.required && (value === undefined || value === null || value === '')) {
          newErrors[field.key] = `${field.label} es requerido`;
          return;
        }
      }

      // Validación personalizada (solo si hay valor)
      if (field.validation && value !== undefined && value !== null && value !== '') {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.key] = validationError;
        }
      }

      // Validación especial para campos password con confirmación
      if (field.type === 'password' && field.confirmField && value) {
        const confirmValue = formData[field.confirmField];
        if (value !== confirmValue) {
          newErrors[field.confirmField] = 'Las contraseñas no coinciden';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !hasChanges) return;


    // Manejo de palabras plurales temrminadas en s
    const singularEntityType = entityType.endsWith("s") ? entityType.slice(0, -1) : entityType;

    try {
      // Preparar datos para enviar
      const dataToSend = { ...formData };

      // Remover campos de confirmación antes de enviar
      fields.forEach(field => {
        if (field.type === 'password' && field.confirmField) {
          delete dataToSend[field.confirmField];
        }
        // Remover campos password vacíos (no actualizar si está vacío)
        if (field.type === 'password' && (!dataToSend[field.key] || dataToSend[field.key] === '')) {
          delete dataToSend[field.key];
        }
      });

      await updateEntity(entityId, dataToSend as Partial<T>);

      // Redirigir a página de detalle
      const redirectPath = detailPath || `/${entityType}/${entityId}`;
      navigate(redirectPath);

      setTimeout(() => {
        notifyEntityUpdated(singularEntityType);
      }, 100);

    } catch (err) {
      notifyEntityError('actualizar', singularEntityType);
    }
  };

  const renderField = (field: EditField): React.ReactNode => {
    const value = formData[field.key];
    const error = errors[field.key];

    const commonProps = {
      id: field.key,
      value: value ?? '',

      className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue focus:ring-1 sm:text-sm text-gray-950 placeholder-gray-600 ${error ? 'border-red-300' : ''
        }`
    };

    switch (field.type) {
      case 'display':
        // Obtener el valor a mostrar
        let displayValue = '';

        if (field.displayValue && data) {
          // Usar función personalizada de formateo
          displayValue = field.displayValue(data);
        } else if (field.displayPath && data) {
          // Usar ruta anidada
          displayValue = getNestedValue(data, field.displayPath) || '';
        } else if (data) {
          // Usar el key directo
          displayValue = (data as any)[field.key] || '';
        }

        return (
          <div className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {displayValue}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={field.placeholder}
            rows={3}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
          />
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            step="any"
            placeholder={field.placeholder}
            onChange={(e) => handleInputChange(field.key, e.target.value ? parseFloat(e.target.value) : '')}
          />
        );

      case 'boolean':
        return (
          <select
            {...commonProps}
            onChange={(e) => handleInputChange(field.key, e.target.value === 'true')}
          >
            <option value="">Seleccionar...</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        );

      case 'select':
        return (
          <select
            {...commonProps}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'infiniteSelect':
        if (!field.infiniteEndpoint) {
          return <div className="text-red-500">Error: infiniteEndpoint requerido</div>;
        }

        // Obtener el valor de display inicial desde el objeto relacionado
        const getInitialDisplayValue = (): string | undefined => {
          if (!data || !value) return undefined;

          // Buscar el objeto relacionado basado en el key
          const relationKey = field.key.replace('_id', ''); // categoria_id -> categoria
          const relatedObject = (data as any)[relationKey];

          return relatedObject?.nombre;
        };

        return (
          <InfiniteScrollSelect
            endpoint={field.infiniteEndpoint}
            value={value}
            onChange={(newValue) => handleInputChange(field.key, newValue)}
            placeholder={field.placeholder || "Seleccionar..."}
            required={field.required}
            initialDisplayValue={getInitialDisplayValue()}
          />
        );

      case 'password':
        return (
          <input
            {...commonProps}
            type="password"
            placeholder={field.placeholder || "Dejar vacío para no cambiar"}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            autoComplete="new-password"
          />
        );

      case 'text':
      default:
        return (
          <input
            {...commonProps}
            type="text"
            placeholder={field.placeholder}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
          />
        );
    }
  };

  if (isLoadingData) {
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

  if (loadError) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Volver
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
            ← Volver
          </button>
        </div>

        {/* Div para title, subtitle */}
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
        </div>
      </div>

      {/* Error de actualización */}
      {updateError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{updateError}</p>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-app border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <label
                  htmlFor={field.key}
                  className="block font-medium text-gray-500"
                >
                  {field.label} {field.required && field.type !== 'display' && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
                {errors[field.key] && (
                  <p className="text-sm text-red-600">{errors[field.key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
          >
            Cancelar
          </button>
          <button
            id='editar-boton'
            type="submit"
            disabled={isUpdating || !hasChanges}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue ${isUpdating || !hasChanges
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue hover:bg-blue_hover'
              }`}
          >
            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}