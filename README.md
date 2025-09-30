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
  - [Automatización con Makefile](#automatización-con-makefile)
  - [Testing y Calidad](#testing-y-calidad)
    - [Pruebas Unitarias](#pruebas-unitarias)
    - [Pruebas de Rendimiento](#pruebas-de-rendimiento)
    - [Pruebas Funcionales e Integración](#pruebas-funcionales-e-integración)
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

El proyecto implementa una **arquitectura modular orientada a servicios** con separación clara entre componentes:

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
├── frontend/                    # Aplicación React (Puerto 5173)
│   ├── src/
│   │   ├── pages/              # Páginas principales del sistema
│   │   ├── components/         # Componentes reutilizables
│   │   └── api/                # Configuración de servicios
│   ├── cypress/                # Pruebas funcionales e integración
│   │   ├── e2e/               # Tests end-to-end por funcionalidad
│   │   ├── support/           # Comandos y configuraciones
│   │   └── fixtures/          # Datos de prueba
│   └── README.md               # Documentación específica del frontend
├── backend/                     # API FastAPI (Puerto 8000)
│   ├── app/
│   │   ├── api/               # Endpoints de la API
│   │   ├── models/            # Modelos de datos
│   │   └── services/          # Lógica de negocio
│   ├── tests/
│   │   ├── unit/              # Pruebas unitarias (pytest)
│   │   └── performance/       # Pruebas de rendimiento (locust)
│   ├── Makefile                # Automatización de tareas
│   └── README.md               # Documentación específica del backend
└── README.md                    # Este archivo - documentación general
```

## Automatización con Makefile

El proyecto incluye un **Makefile** del lado del backend que simplifica la ejecución de tareas comunes de desarrollo, testing y despliegue. Este archivo proporciona atajos para comandos frecuentes del proyecto.

### Prerrequisito
- **GNU Make:** Versión 4.0 o superior
- **Versión recomendada:** GNU Make 4.4.1 (usada en el entorno de desarrollo)

### Comandos Disponibles

**Gestión de Base de Datos:**
- `make db-dev` - Inicialización de la base de datos en modo desarrollo (init + seed)
- `make db-test` - Inicialización de la base de datos en modo prueba (reset + init + seed)

**Servidores de Desarrollo:**
- `make dev` - Ejecuta el servidor backend en modo desarrollo
- `make test` - Ejecuta el servidor backend en modo prueba

**Testing:**
- `make pytest-intro` - Información detallada sobre el entorno de pruebas unitarias
- `make unit-all` - Ejecuta todas las pruebas unitarias
- `make locust-intro` - Información sobre el entorno de pruebas de rendimiento
- `make locust-interactivo` - Sandbox para pruebas de rendimiento con GUI

Para ver todos los comandos disponibles revisar el archivo **Makefile**

## Testing y Calidad

El proyecto implementa una **estrategia de testing integral** que abarca diferentes niveles y tipos de pruebas para garantizar la calidad y confiabilidad del sistema.

### Pruebas Unitarias

**Tecnología:** pytest + SQLite  
**Ubicación:** `backend/tests/unit/`  
**Cobertura:** 290 pruebas unitarias ~ 94 %

Las pruebas unitarias se enfocan en validar la **lógica de negocio** del sistema de forma aislada. Utilizan una base de datos SQLite in-memory para optimizar el rendimiento y garantizar la independencia entre tests.

**Características:**
- **Cobertura completa** de servicios y funciones críticas
- **Base de datos temporal** que se reinicia entre cada test
- **Mocks y fixtures** para aislar dependencias externas
- **Validación de casos límite** y manejo de errores

**Ejecución:**
```bash
# Información del entorno de testing
python -m tests.unit.pytest_intro
# o usando Makefile
make pytest-intro

# Ejecutar todas las pruebas unitarias
make unit-all
```

### Pruebas de Rendimiento

**Tecnología:** Locust + MySQL  
**Ubicación:** `backend/tests/performance/`  
**Escenarios:** 3 niveles de carga (bajo, medio, alto)

Las pruebas de rendimiento evalúan el **comportamiento de los endpoints** bajo diferentes cargas de trabajo, simulando escenarios reales de uso del sistema.

**Características:**
- **Simulación de usuarios concurrentes** con patrones de uso realistas
- **Medición de tiempos de respuesta** y throughput
- **Detección de cuellos de botella** en la API
- **Base de datos MySQL** dedicada para pruebas

**Ejecución:**

Se debe garantizar con anterioridad el despliegue del servidor de base de datos.

```bash
# Información del entorno de performance
python -m tests.performance.locust_intro
# o usando Makefile
make locust-intro

# Ejecutar pruebas de rendimiento
make server-test # Inicializa base de datos de pruebas y ejecuta servidor uvicorn

make locust-low
make locust-medium
make locust-high
```

### Pruebas Funcionales e Integración

**Tecnología:** Cypress  
**Ubicación:** `frontend/cypress/`  
**Cobertura:** 30 requisitos funcionales | 84 casos de prueba

Las pruebas funcionales validan el **sistema completo** desde la perspectiva del usuario final, verificando que todos los requisitos funcionales se cumplan correctamente.

**Características:**
- **Simulación de usuario real** interactuando con la interfaz
- **Testing end-to-end** que incluye frontend, backend y base de datos
- **Casos positivos y negativos** para cada funcionalidad
- **Validación de flujos completos** de trabajo

**Distribución de pruebas:**
- **30 requisitos funcionales** del sistema
- **84 casos de prueba** total (positivos y negativos)
- **Cobertura completa** de todos los módulos del sistema

**Ejecución:**

Se debe garantizar con anterioridad el despliegue de servidores de base de datos, backend (con entorno de test) y frontend.

```bash
# En la ruta de backend
make server-test # Inicializa base de datos de pruebas y ejecuta servidor uvicorn

# Ejecutar pruebas funcionales
npx cypress run
# Acceder al entorno interactivo con GUI
npx cypress open
```

## Inicio Rápido

### Prerrequisitos
- **Node.js** 18.0 o superior (para el frontend)
- **Python** 3.8 o superior (para el backend)
- **MySQL** Server (base de datos)
- **GNU Make** 4.0 o superior (para automatización)
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
- **env.dev**
```env.dev
DATABASE_URL=mysql+mysqlconnector://usuario:password@localhost:3306/sonyco_db
SECRET_KEY=tu_clave_secreta
ENTORNO=dev
```
- **env.test**
```env.test
DATABASE_URL=mysql+mysqlconnector://usuario:password@localhost:3306/sonyco_db_test
SECRET_KEY=tu_clave_secreta
ENTORNO=test
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

6. **Poblar la base de datos:**
```bash
# Método tradicional
cd backend
python -m app.db.seed

# Usando Makefile
make seed-dev

# Puedes usar el usuario admin@admin.com, con contraseña admin
```

7. **Ejecutar el sistema:**

- **Backend:**
```bash
cd backend
uvicorn app.main:app --reload

# Con makefile
make dev
```

- **Frontend:**
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
- **Testing y calidad:** Estrategia integral de pruebas automatizadas
- **DevOps básico:** Automatización de tareas con Makefile

### Nota Importante
Algunas funcionalidades están configuradas específicamente para fines demostrativos y académicos (como el registro abierto de usuarios). En un entorno de producción real, estas configuraciones serían ajustadas según los requerimientos de seguridad empresarial.

## Contacto

Para más información sobre el proyecto o reporte de alguna inconsistencia, por favor, contáctame: andresfma.dev@gmail.com

---

**Desarrollado como proyecto académico ADSO - SENA**  
*Demostrando la integración de tecnologías modernas para soluciones empresariales reales*