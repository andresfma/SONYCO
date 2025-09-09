import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntityCreate } from '../../hooks/Views/useEntityCreate';
import { InfiniteScrollSelect } from '../Auxiliaries/InfiniteScrollSelect';
import { useNotificationHelpers } from '../../hooks/Auxiliaries/useNotificationHelpers';

// Reutilizar la interfaz EditField del componente de edición
export interface CreateField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select' | 'infiniteSelect' | 'boolean' | 'password';
  required?: boolean;
  placeholder?: string;
  validation?: (value: any) => string | null;
  defaultValue?: any;
  // Para select infinito (FK)
  infiniteEndpoint?: string;
  // Para select normal
  options?: { value: any; label: string }[];
  // Para campo password
  confirmField?: string; // Key del campo de confirmación
}

export interface EntityCreateViewProps {
  entityType: string;
  title: string;
  subtitle?: string;
  fields: CreateField[];
  backPath: string;
  className?: string;
}

export function EntityCreateView<T>({
  entityType,
  title,
  subtitle,
  fields,
  backPath,
  className = ""
}: EntityCreateViewProps) {

  const navigate = useNavigate();
  const { notifyEntityCreated, notifyEntityError } = useNotificationHelpers();

  // Hook para crear entidad
  const { isLoading: isCreating, error: createError, createEntity } = useEntityCreate<T>({
    entityType
  });

  // Estado del formulario
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});



  // Inicializar formulario con valores por defecto
  useEffect(() => {
    const initialData: Record<string, any> = {};

    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.key] = field.defaultValue;
      } else {
        // Valores por defecto según el tipo
        switch (field.type) {
          case 'boolean':
            initialData[field.key] = true; // Por defecto activo
            break;
          case 'number':
            initialData[field.key] = '';
            break;
          default:
            initialData[field.key] = '';
        }
      }
    });

    setFormData(initialData);
  }, [fields]);

  const handleBack = () => {
    if (`/${backPath}`) {
      navigate(`/${backPath}`);
    } else {
      navigate(-1);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));

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
      const value = formData[field.key];

      // Validación requerido
      if (field.required && (value === undefined || value === null || value === '')) {
        newErrors[field.key] = `${field.label} es requerido`;
        return;
      }

      // Validación personalizada
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

    if (!validateForm()) return;

    try {
      // Remover campos de confirmación antes de enviar
      const dataToSend = { ...formData };
      fields.forEach(field => {
        if (field.type === 'password' && field.confirmField) {
          delete dataToSend[field.confirmField];
        }
      });

      const newEntity = await createEntity(dataToSend as Omit<T, 'id'>);

      // Redirigir PRIMERO a página de detalles
      const redirectPath = `/${backPath}/${(newEntity as any).id}`;
      navigate(redirectPath);

      // Notificar despues de la navegación
      setTimeout(() => {
        notifyEntityCreated(backPath.slice(0, -1));
      }, 100);

    } catch (err) {
      // Notificar error inmediatamente
      notifyEntityError('crear', backPath.slice(0, -1));
    }
  };

  const renderField = (field: CreateField): React.ReactNode => {
    const value = formData[field.key];
    const error = errors[field.key];

    const commonProps = {
      id: field.key,
      value: value ?? '',
      className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue focus:ring-1 sm:text-sm text-gray-950 placeholder-gray-600 ${error ? 'border-red-300' : ''
        }`
    };

    switch (field.type) {
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
            <option value="" disabled>Seleccionar...</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        );

      case 'select':
        return (
          <select
            {...commonProps}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue focus:ring-1 sm:text-sm placeholder-gray-600 ${error ? 'border-red-300' : ''
              } ${value ? 'text-gray-950' : 'text-gray-600'}`}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
          >
            <option value="" disabled className="text-gray-600">
              {field.placeholder || 'Seleccionar...'}
            </option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value} className="text-gray-950">
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'infiniteSelect':
        if (!field.infiniteEndpoint) {
          return <div className="text-red-500">Error: infiniteEndpoint requerido</div>;
        }

        return (
          <InfiniteScrollSelect
            endpoint={field.infiniteEndpoint}
            value={value}
            onChange={(newValue) => handleInputChange(field.key, newValue)}
            placeholder={field.placeholder || "Seleccionar..."}
            required={field.required}
          />
        );

      case 'password':
        return (
          <input
            {...commonProps}
            type="password"
            placeholder={field.placeholder}
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
        </div>
      </div>

      {/* Error de creación */}
      {createError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{createError}</p>
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
                  {field.label} {field.required && <span className="text-red-500">*</span>}
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
            id="crear-boton"
            type="submit"
            disabled={isCreating}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue ${isCreating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue hover:bg-blue_hover'
              }`}
          >
            {isCreating ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}