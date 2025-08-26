# Sistema SONYCO

**SONYCO** es un sistema integral de gestión interna desarrollado como proyecto final académico del tecnólogo **ADSO (Análisis y Desarrollo de Software)** impartido por el SENA. El proyecto implementa una solución fullstack completa para la gestión administrativa y operativa de empresas dedicadas a la comercialización de productos.

# Índice

- [Sistema SONYCO](#sistema-sonyco)
  - [¿Qué es SONYCO?](#qué-es-sonyco)
  - [Objetivo del Proyecto](#objetivo-del-proyecto)
  - [Características Principales](#características-principales)
  - [Arquitectura del Sistema](#arquitectura-del-sistema)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Base de Datos](#base-de-datos)
  - [Entidades del Sistema](#entidades-del-sistema)
  - [Funcionalidades Destacadas](#funcionalidades-destacadas)
    - [Integridad de Datos](#integridad-de-datos)
    - [Gestión de Ventas](#gestión-de-ventas)
    - [Control de Usuarios](#control-de-usuarios)
  - [Estructura del Repositorio](#estructura-del-repositorio)
  - [Inicio Rápido](#inicio-rápido)
    - [Prerrequisitos](#prerrequisitos)
    - [Configuración Completa](#configuración-completa)
  - [Contexto Académico](#contexto-académico)
    - [Nota Importante](#nota-importante)
  - [Contacto](#contacto)

## ¿Qué es SONYCO?

Es una aplicación web diseñada para automatizar, optimizar y organizar los procesos administrativos y operativos que tradicionalmente se realizan de manera manual en empresas comercializadoras. El sistema centraliza la gestión de productos, categorías, inventarios, ventas, clientes y usuarios en una plataforma integrada y fácil de usar.

**Caso de uso principal:** Empresa SONYCO - comercialización de productos de construcción.

## Objetivo del Proyecto

Demostrar la integración de tecnologías modernas orientadas a servicios para crear una solución empresarial completa que permita:

- **Automatizar procesos manuales** y reducir errores operativos
- **Centralizar información** en una plataforma única y confiable
- **Mejorar la trazabilidad** de operaciones comerciales e inventarios
- **Optimizar la gestión** de recursos y tiempo del personal administrativo
- **Proporcionar información en tiempo real** para la toma de decisiones

## Características Principales

- **Gestión completa de clientes** con historial de compras
- **Control integral de inventarios** con trazabilidad automática
- **Registro eficiente de ventas** con soporte multi-producto
- **Administración de catálogo** con categorías personalizables
- **Control de acceso** con permisos diferenciados por usuario
- **Historial inmutable** de todos los movimientos del sistema

## Arquitectura del Sistema

El proyecto implementa una **arquitectura orientada a servicios (SOA)** con separación clara entre componentes:

### Frontend
- **Tecnología:** React + TypeScript + Vite + Tailwind CSS
- **Características:** Interface moderna, responsiva y optimizada para UX
- **Funcionalidad:** Consume APIs RESTful y maneja estados complejos

### Backend  
- **Tecnología:** Python + FastAPI + SQLModel + Pydantic
- **Características:** API RESTful robusta con documentación automática
- **Funcionalidad:** Lógica de negocio, validaciones y gestión de datos

### Base de Datos
- **Tecnología:** MySQL
- **Características:** Modelo relacional con integridad referencial estricta
- **Funcionalidad:** Almacenamiento persistente y transaccional

## Entidades del Sistema

El sistema gestiona las siguientes entidades principales:

- **Usuarios:** Control de acceso y permisos (administradores y usuarios regulares)
- **Clientes:** Base de datos completa de compradores
- **Productos:** Catálogo con especificaciones y precios
- **Categorías:** Clasificación organizacional de productos
- **Inventarios:** Control de stock en tiempo real
- **Ventas:** Registro de transacciones comerciales
- **Detalle de Ventas:** Productos específicos por transacción
- **Movimientos de Inventario:** Trazabilidad inmutable de cambios en stock

## Funcionalidades Destacadas

### Integridad de Datos
- **Eliminaciones inteligentes:** El sistema previene la eliminación de elementos que están siendo utilizados
- **Desactivación segura:** Opción de ocultar elementos sin perder información histórica
- **Trazabilidad completa:** Registro automático de todos los movimientos que afectan inventarios

### Gestión de Ventas
- **Proceso simplificado:** Selección de cliente y agregado de productos uno por uno
- **Soporte multi-producto:** Una venta puede incluir múltiples productos diferentes
- **Actualización automática:** El inventario se ajusta automáticamente con cada venta

### Control de Usuarios
- **Roles diferenciados:** Administradores con permisos especiales y usuarios regulares
- **Gestión completa:** Los administradores pueden activar, desactivar y gestionar cualquier cuenta
- **Registro abierto:** Funcionalidad habilitada para fines académicos y demostrativos

## Estructura del Repositorio

```
SONYCO/
├── frontend/          # Aplicación React (Puerto 5173)
│   ├── src/
│   │   ├── pages/     # Páginas principales del sistema
│   │   ├── components/# Componentes reutilizables
│   │   └── api/       # Configuración de servicios
│   └── README.md      # Documentación específica del frontend
├── backend/           # API FastAPI (Puerto 8000)
│   ├── app/
│   │   ├── api/       # Endpoints de la API
│   │   ├── models/    # Modelos de datos
│   │   └── services/  # Lógica de negocio
│   └── README.md      # Documentación específica del backend
└── README.md          # Este archivo - documentación general
```

## Inicio Rápido

### Prerrequisitos
- **Node.js** 18.0 o superior (para el frontend)
- **Python** 3.8 o superior (para el backend)
- **MySQL** Server (base de datos)
- **Git** (control de versiones)

### Configuración Completa

1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd SONYCO
```

2. **Configurar el Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

3. **Configurar variables de entorno del backend:**
```env
DATABASE_URL=mysql+mysqlconnector://usuario:password@localhost:3306/sonyco_db
SECRET_KEY=tu_clave_secreta
```

4. **Configurar el Frontend:**
```bash
cd frontend
npm install
```

5. **Configurar variables de entorno del frontend:**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=SONYCO
```

6. **Inicializar la base de datos:**
```bash
# Desde la carpeta backend
python -m app.db.seed

# Puedes usar el usuario admin@admin.com, con contraseña admin
```

7. **Ejecutar el sistema:**

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

8. **Acceder al sistema:**
- **Aplicación web:** http://localhost:5173
- **API Documentation:** http://localhost:8000/docs

## Contexto Académico

Este proyecto fue desarrollado como **demostración práctica** de competencias en:

- **Arquitectura de software:** Implementación de patrones y principios de diseño
- **Tecnologías fullstack:** Integración de frontend, backend y base de datos
- **Buenas prácticas:** Código limpio, documentación y estructuración modular
- **Gestión de proyectos:** Desarrollo incremental con enfoque ágil
- **Casos de uso reales:** Solución a problemáticas empresariales concretas

### Nota Importante
Algunas funcionalidades están configuradas específicamente para fines demostrativos y académicos (como el registro abierto de usuarios). En un entorno de producción real, estas configuraciones serían ajustadas según los requerimientos de seguridad empresarial.

## Contacto

Para más información sobre el proyecto o reporte de alguna incosistencia, por favor, contáctame: andresfma.dev@gmail.com

---

**Desarrollado como proyecto académico ADSO - SENA**  
*Demostrando la integración de tecnologías modernas para soluciones empresariales reales*