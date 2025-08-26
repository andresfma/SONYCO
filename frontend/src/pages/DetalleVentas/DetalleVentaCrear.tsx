import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEntityCreate } from '../../hooks/Views/useEntityCreate';
import { InfiniteScrollSelect } from '../../components/Auxiliaries/InfiniteScrollSelect';
import { useNotificationHelpers } from '../../hooks/Auxiliaries/useNotificationHelpers';
import type { DetalleVenta } from '../../types/index';

// Interfaz específica para campos de creación de detalle venta
interface CreateField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select' | 'infiniteSelect' | 'boolean' | 'password';
  required?: boolean;
  placeholder?: string;
  validation?: (value: any) => string | null;
  defaultValue?: any;
  infiniteEndpoint?: string;
  options?: { value: any; label: string }[];
}

export default function DetalleVentaCrear() {
  const navigate = useNavigate();
  const { ventaId } = useParams<{ ventaId: string }>();
  const { notifyEntityCreated, notifyEntityError } = useNotificationHelpers();

  // Validar que tenemos ventaId
  if (!ventaId || isNaN(parseInt(ventaId, 10))) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-red-600">ID de venta inválido</p>
          <button
            onClick={() => navigate('/ventas')}
            className="mt-4 bg-blue hover:bg-blue_hover text-white px-4 py-2 rounded transition-colors"
          >
            Volver a ventas
          </button>
        </div>
      </div>
    );
  }

  const ventaIdNum = parseInt(ventaId, 10);

  // Hook para crear detalle venta
  const { isLoading: isCreating, error: createError, createEntity } = useEntityCreate<DetalleVenta>({
    entityType: `detalle_venta/${ventaIdNum}` // URL específica para detalles de venta
  });

  // Estado del formulario
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Configuración de campos
  const detalle_ventaCreateFields: CreateField[] = [
    {
      key: 'producto_id',
      label: 'Producto',
      type: 'infiniteSelect',
      required: true,
      infiniteEndpoint: 'productos/infinito/movimiento',
      placeholder: 'Buscar y seleccionar...'
    },
    {
      key: 'cantidad',
      label: 'Cantidad',
      type: 'number',
      required: true,
      placeholder: '0.00',
      validation: (value) => {
        if (value !== undefined && value !== null && value <= 0) {
          return 'La cantidad debe ser mayor a 0';
        }
        return null;
      }
    },
    {
      key: 'precio_unitario',
      label: 'Precio Unitario',
      type: 'number',
      placeholder: 'Incluye descuentos o promociones',
      validation: (value) => {
        if (value !== undefined && value !== null && value <= 0) {
          return 'El precio debe ser mayor a 0';
        }
        return null;
      }
    },
  ];

  // Inicializar formulario con valores por defecto
  useEffect(() => {
    const initialData: Record<string, any> = {
      venta_id: ventaIdNum // Agregar automáticamente el ID de la venta
    };

    detalle_ventaCreateFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.key] = field.defaultValue;
      } else {
        switch (field.type) {
          case 'boolean':
            initialData[field.key] = true;
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
  }, [ventaIdNum]);

  const handleBack = () => {
    navigate(`/ventas/${ventaIdNum}`);
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    detalle_ventaCreateFields.forEach(field => {
      const value = formData[field.key];

      if (field.required && (value === undefined || value === null || value === '')) {
        newErrors[field.key] = `${field.label} es requerido`;
        return;
      }

      if (field.validation && value !== undefined && value !== null && value !== '') {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.key] = validationError;
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
      const dataToSend = {
        ...formData,
        venta_id: ventaIdNum // Asegurar que siempre incluya el venta_id
      };

      await createEntity(dataToSend as Omit<DetalleVenta, 'id'>);

      // Redirigir a la vista de detalle de la venta
      navigate(`/ventas/${ventaIdNum}`);

      // Notificar éxito
      setTimeout(() => {
        notifyEntityCreated('detalle de venta');
      }, 100);

    } catch (err) {
      notifyEntityError('agregar', 'producto a la venta');
    }
  };

  const renderField = (field: CreateField): React.ReactNode => {
    const value = formData[field.key];
    const error = errors[field.key];

    const commonProps = {
      id: field.key,
      value: value ?? '',
      required: field.required,
      className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue focus:ring-blue focus:ring-1 sm:text-sm text-gray-950 placeholder-gray-600 ${
        error ? 'border-red-300' : ''
      }`
    };

    switch (field.type) {
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
            error={error}
            required={field.required}
          />
        );

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
    <div className="p-4">
      {/* Header */}
      <div className='pb-2'>
        <div className="mb-2">
          <button
            onClick={handleBack}
            className="text-blue hover:text-blue_hover font-medium transition-colors"
          >
            ← Volver a la venta
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-cl_font_main">
              Agregar Producto a la Venta N°{ventaIdNum}
            </h1>
            <p className="text-cl_font_sec mt-1">
              Selecciona un producto y define la cantidad y precio para esta sub-venta.
            </p>
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
            {detalle_ventaCreateFields.map((field) => (
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
            type="submit"
            disabled={isCreating}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue ${
              isCreating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue hover:bg-blue_hover'
            }`}
          >
            {isCreating ? 'Agregando...' : 'Agregar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}