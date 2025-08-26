import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('user');

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue hover:text-blue_hover font-medium transition-colors"
        >
          ← Volver
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-8 pb-2">
        <div>
          <h1 className="text-2xl font-semibold text-cl_font_main">
            Sobre la aplicación
          </h1>
          <p className="text-cl_font_sec mt-1">
            Sistema de gestión interna SONYCO - Información del proyecto y uso del aplicativo
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('user')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Para Usuarios
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'technical'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Información Técnica
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'user' && (
        <div className="space-y-6">
          {/* Project Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-cl_font_main mb-4">
              ¿Qué es el Sistema SONYCO?
            </h2>
            <p className="text-cl_font_sec mb-4">
              SONYCO es un sistema de gestión interna diseñado específicamente para empresas dedicadas a la comercialización de productos. 
              Esta aplicación web permite al personal administrativo autorizado automatizar, optimizar y organizar los procesos 
              administrativos y operativos que tradicionalmente se realizan de manera manual.
            </p>
            <p className="text-cl_font_sec">
              El sistema centraliza la gestión de productos, categorías, inventarios, ventas, clientes y usuarios 
              en una plataforma integrada y fácil de usar.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-cl_font_main mb-6">
              Preguntas Frecuentes
            </h2>
            
            <div className="space-y-4">
              {/* FAQ Item 1 */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-cl_font_main mb-2">
                  ¿Por qué no puedo eliminar algunos elementos del sistema?
                </h3>
                <p className="text-cl_font_sec">
                  Cuando un elemento (como un cliente, producto o categoría) ya está siendo utilizado 
                  en otras partes del sistema, no se puede eliminar para mantener la integridad de 
                  la información. Por ejemplo, no puedes eliminar un cliente que ya tiene ventas 
                  registradas, ya que esto causaría pérdida de información importante para tu negocio.
                </p>
              </div>

              {/* FAQ Item 2 */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-cl_font_main mb-2">
                  ¿Para qué sirve la función "Desactivar"?
                </h3>
                <p className="text-cl_font_sec">
                  La función de desactivar permite "ocultar" elementos sin eliminarlos completamente. 
                  Esto es útil cuando ya no necesitas usar un producto o categoría, pero quieres 
                  mantener el historial. Los elementos desactivados no aparecerán en las listas 
                  cuando crees nuevos registros, pero seguirán visibles en los registros históricos.
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-cl_font_main mb-2">
                  ¿Por qué cualquiera puede crear una cuenta nueva?
                </h3>
                <p className="text-cl_font_sec">
                  Esta funcionalidad está habilitada para fines académicos y de demostración. 
                  En un entorno de producción real, la creación de cuentas estaría restringida 
                  únicamente a administradores autorizados para mantener la seguridad del sistema.
                </p>
              </div>

              {/* FAQ Item 4 */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-cl_font_main mb-2">
                  ¿Qué diferencias hay entre ser administrador y usuario regular?
                </h3>
                <p className="text-cl_font_sec">
                  Los administradores tienen permisos especiales para gestionar todo el personal del sistema. 
                  Pueden ver información de todos los usuarios, activar o desactivar cuentas, eliminar usuarios 
                  cuando sea necesario y restablecer contraseñas de cualquier cuenta registrada. Los usuarios 
                  regulares solo pueden acceder a las funcionalidades operativas del sistema.
                </p>
              </div>

              {/* FAQ Item 5 */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-cl_font_main mb-2">
                  ¿Cómo funciona el registro de ventas?
                </h3>
                <p className="text-cl_font_sec">
                  Crear una venta es muy sencillo: haz clic en "Nueva Venta", selecciona el cliente comprador 
                  y luego agrega uno por uno los productos que se vendieron. El sistema permite vender múltiples 
                  productos diferentes en una sola transacción, registrando cada producto por separado pero 
                  agrupándolos en la misma venta para mantener el orden y la organización.
                </p>
              </div>

              {/* FAQ Item 6 */}
              <div>
                <h3 className="font-medium text-cl_font_main mb-2">
                  ¿Cómo funciona el historial de movimientos?
                </h3>
                <p className="text-cl_font_sec mb-2">
                  El sistema crea automáticamente un registro en el historial cada vez que ocurre 
                  una actividad que afecte el inventario. Esto sucede cuando:
                </p>
                <ul className="text-cl_font_sec ml-4 space-y-1">
                  <li>• Se registra una venta</li>
                  <li>• Se hace un movimiento de inventario (entrada o salida)</li>
                  <li>• Se modifica o elimina una venta</li>
                  <li>• Se edita directamente el inventario</li>
                </ul>
                <p className="text-cl_font_sec mt-2">
                  No necesitas preocuparte por actualizar el inventario manualmente, el sistema 
                  lo hace automáticamente basado en estos movimientos.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-cl_font_main mb-4">
              Funcionalidades del Sistema
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-cl_font_main">Gestión de Clientes</h3>
                <p className="text-sm text-cl_font_sec">Registra y administra información de clientes</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-cl_font_main">Control de Inventario</h3>
                <p className="text-sm text-cl_font_sec">Monitorea stock y movimientos de productos</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-cl_font_main">Registro de Ventas</h3>
                <p className="text-sm text-cl_font_sec">Documenta y rastrea todas las transacciones</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-cl_font_main">Gestión de Productos</h3>
                <p className="text-sm text-cl_font_sec">Administra catálogo y categorías de productos</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-cl_font_main">Control de Usuarios</h3>
                <p className="text-sm text-cl_font_sec">Administra accesos y permisos del personal</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-cl_font_main">Historial de Movimientos</h3>
                <p className="text-sm text-cl_font_sec">Trazabilidad completa de todas las operaciones</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="space-y-6">
          {/* Project Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-cl_font_main mb-4">
              Descripción del Proyecto
            </h2>
            <p className="text-cl_font_sec mb-4">
              Sistema integrador de tecnologías orientadas a servicios desarrollado como proyecto final académico
              del tecnólogo ADSO (Análisis y Desarrollo de Software), impartido por el SENA. 
              Implementa una arquitectura completa fullstack para la gestión interna empresarial, siguiendo 
              principios de software orientado a servicios y buenas prácticas de desarrollo.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Objetivo:</strong> Automatizar, optimizar y organizar procesos administrativos y 
                operativos internos que tradicionalmente se realizan de manera manual o desorganizada.
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-cl_font_main mb-4">
              Stack Tecnológico
            </h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-cl_font_main flex items-center">
                  <span className="w-3 h-3 bg-blue rounded-full mr-2"></span>
                  Frontend
                </h3>
                <div className="space-y-2 ml-5">
                  <div className="text-sm">
                    <span className="font-medium">React</span>
                    <p className="text-cl_font_sec text-xs">Biblioteca de JavaScript para interfaces de usuario</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Vite</span>
                    <p className="text-cl_font_sec text-xs">Herramienta de construcción y desarrollo</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Tailwind CSS</span>
                    <p className="text-cl_font_sec text-xs">Framework CSS utility-first</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-cl_font_main flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Backend
                </h3>
                <div className="space-y-2 ml-5">
                  <div className="text-sm">
                    <span className="font-medium">FastAPI</span>
                    <p className="text-cl_font_sec text-xs">Framework web moderno de Python</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">SQLModel</span>
                    <p className="text-cl_font_sec text-xs">ORM para interacción con base de datos</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Pydantic</span>
                    <p className="text-cl_font_sec text-xs">Validación de datos y serialización</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-cl_font_main flex items-center">
                  <span className="w-3 h-3 bg-orange rounded-full mr-2"></span>
                  Base de Datos
                </h3>
                <div className="space-y-2 ml-5">
                  <div className="text-sm">
                    <span className="font-medium">MySQL</span>
                    <p className="text-cl_font_sec text-xs">Sistema de gestión de base de datos relacional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-cl_font_main mb-4">
              Arquitectura y Diseño
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-cl_font_main mb-2">Patrón Arquitectónico</h3>
                <p className="text-cl_font_sec">
                  Arquitectura orientada a servicios (SOA) con separación clara entre frontend y backend. 
                  Estructura modular organizada por dominios para mantener código limpio y escalable.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-cl_font_main mb-2">Principios de Diseño</h3>
                <ul className="text-cl_font_sec space-y-1 ml-4">
                  <li>• Separación de responsabilidades</li>
                  <li>• Código modular y reutilizable</li>
                  <li>• API RESTful bien documentada</li>
                  <li>• Validación robusta de datos</li>
                  <li>• Manejo de errores consistente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Model */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-cl_font_main mb-4">
              Modelo de Datos y Entidades
            </h2>
            <p className="text-cl_font_sec mb-4">
              El sistema implementa operaciones CRUD completas para las siguientes entidades:
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-md p-3">
                  <h4 className="font-medium text-sm">Clientes</h4>
                  <p className="text-xs text-cl_font_sec">Gestión completa de información de clientes</p>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                  <h4 className="font-medium text-sm">Usuarios</h4>
                  <p className="text-xs text-cl_font_sec">Control de acceso y permisos del sistema</p>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                  <h4 className="font-medium text-sm">Productos</h4>
                  <p className="text-xs text-cl_font_sec">Catálogo de productos y especificaciones</p>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                  <h4 className="font-medium text-sm">Inventarios</h4>
                  <p className="text-xs text-cl_font_sec">Control de stock y disponibilidad</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="border border-orange-200 bg-orange-50 rounded-md p-3">
                  <h4 className="font-medium text-sm">Movimientos de Inventario</h4>
                  <p className="text-xs text-cl_font_sec">
                    <strong>Solo lectura y creación:</strong> Mantiene trazabilidad inmutable
                  </p>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                  <h4 className="font-medium text-sm">Ventas y Detalle de Ventas</h4>
                  <p className="text-xs text-cl_font_sec">Estructura dual: registro principal de venta y detalles por producto</p>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                  <h4 className="font-medium text-sm">Categorías</h4>
                  <p className="text-xs text-cl_font_sec">Clasificación y organización de productos</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-sm mb-2">Integridad Referencial y Estructura de Ventas</h4>
              <p className="text-xs text-cl_font_sec mb-2">
                El sistema implementa relaciones estrictas entre entidades para mantener la consistencia 
                de datos. Los movimientos de inventario se generan automáticamente en operaciones de 
                venta y gestión de stock, asegurando trazabilidad completa.
              </p>
              <p className="text-xs text-cl_font_sec">
                <strong>Modelo de Ventas:</strong> Las ventas utilizan una estructura de dos niveles - 
                la entidad Venta registra información general (fecha, cliente, vendedor) mientras que 
                DetalleVenta almacena cada producto vendido individualmente, permitiendo múltiples 
                productos por transacción manteniendo la organización y trazabilidad.
              </p>
            </div>
          </div>

          {/* Development Context */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-cl_font_main mb-4">
              Contexto de Desarrollo
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <div>
                  <p className="text-sm"><strong>Propósito:</strong> Proyecto final académico ADSO</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <div>
                  <p className="text-sm"><strong>Enfoque:</strong> Demostración de integración de tecnologías fullstack</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <div>
                  <p className="text-sm"><strong>Metodología:</strong> Desarrollo ágil con énfasis en buenas prácticas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <div>
                  <p className="text-sm"><strong>Caso de uso:</strong> Empresa SONYCO - comercialización de productos de construcción</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}