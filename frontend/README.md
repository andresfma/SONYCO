# SONYCO Frontend

Este es el frontend de **SONYCO**, un sistema web moderno desarrollado con **React**, **Vite** y **Tailwind CSS**. Proporciona una interfaz de usuario intuitiva y responsiva para gestionar todas las operaciones del sistema a través de una experiencia de usuario optimizada.

## Características

- **Interfaz moderna**: Diseñada con Tailwind CSS para una apariencia profesional y responsiva
- **Integración completa**: Conectado seamlessly con el backend mediante endpoints RESTful
- **Experiencia optimizada**: UI/UX pensada para maximizar la productividad del usuario
- **Desarrollo rápido**: Powered by Vite para hot reload y builds optimizados
- **Type Safety**: Desarrollado con TypeScript para mayor robustez del código

## Estructura del Proyecto

```
src/
├── api/           # Configuración y servicios de API
├── assets/        # Imágenes, íconos y otros recursos estáticos
├── components/    # Componentes reutilizables de UI
├── context/       # Context providers de React
├── hooks/         # Custom hooks de React
├── layouts/       # Layouts y plantillas de página
├── pages/         # Páginas principales de la aplicación
├── routes/        # Configuración de rutas de la aplicación
├── types/         # Definiciones de tipos TypeScript
├── utils/         # Funciones utilitarias
```

## Requisitos Previos

- **Node.js** 18.0 o superior
- **npm** 9.0 o superior (incluido con Node.js)
- **Git**

Para verificar tu versión de Node.js:
```bash
node --version
npm --version
```

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd sonyco-frontend
```

### 2. Instalar Dependencias

Instala todas las dependencias necesarias para recrear la carpeta `node_modules`:

```bash
npm install
```

**Comandos alternativos:**
- `npm install --frozen-lockfile` - Instala exactamente las versiones del lockfile

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=SONYCO
```

**Nota:** Las variables en Vite deben comenzar con `VITE_` para ser accesibles en el cliente.

## Ejecución

### Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173/**

## Tecnologías Utilizadas

- **React 19**: Biblioteca de JavaScript para interfaces de usuario
- **TypeScript**: Superset de JavaScript con tipado estático
- **Vite**: Build tool moderno y rápido
- **Tailwind CSS**: Framework CSS utility-first
- **Node.js**: Entorno de ejecución para el desarrollo

## Contacto

Para más información sobre el proyecto o reporte de alguna incosistencia, por favor, contáctame: andresfma.dev@gmail.com