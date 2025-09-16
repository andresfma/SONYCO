# SONYCO Backend

Este es el backend de **SONYCO**, un sistema de gestión operacional y administrativo para empresas de comercialización de productos. Está desarrollado en **Python** utilizando **FastAPI**, **SQLModel**, **Pydantic** y **MySQL** como base de datos.

## Arquitectura API RESTful

El backend expone una serie de endpoints organizados como una **API RESTful**, implementando:

- Operaciones **CRUD** sobre los recursos del sistema (creación, lectura, actualización y eliminación)
- Uso de métodos HTTP estándar (`GET`, `POST`, `PUT`, `DELETE`)
- Arquitectura **cliente-servidor sin estado**, donde cada petición contiene la información necesaria sin depender de un contexto previo en el servidor
- Respuestas en **JSON**, interoperables y fáciles de consumir desde el frontend u otros clientes

## Estructura del Proyecto

```
app/
├── api/         # Endpoints de la API
├── core/        # Configuración principal
├── db/          # Inicialización de la base de datos, conexión y seeding
├── models/      # Modelos de SQLModel
├── schemas/     # Validaciones y serialización con Pydantic
├── services/    # Lógica de negocio y capa de servicios
└── main.py      # Punto de entrada de la aplicación FastAPI
tests/
├── unit/        # Pruebas unitarias (pytest + SQlite in-memory)
├── perfomance/  # Pruebas de rendimiento (locust)
Makefile         # Automatización de tareas
```

## Automatización con Makefile

El backend incluye un Makefile que facilita la ejecución de tareas comunes.

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

## Testing y calidad

El backend implementa una estrategia de pruebas integral para asegurar calidad y confiabilidad.

### Pruebas Unitarias

Las pruebas unitarias se enfocan en validar la **lógica de negocio** del sistema de forma aislada. Utilizan una base de datos SQLite in-memory para optimizar el rendimiento y garantizar la independencia entre tests.

**Tecnología:** pytest + SQLite in-memory  
**Ubicación:** `tests/unit/`  
**Cobertura:** 290 pruebas unitarias (~ 94%)
  
**Características:**
- Validan la lógica de negocio de forma aislada
- DB temporal reiniciada entre tests
- Uso de fixtures y mocks
- Casos límite y manejo de errores

**Ejecución:**
```bash
# Usando Makefile
make pytest-intro
make unit-all
```

### Pruebas de Rendimiento

Las pruebas de rendimiento evalúan el **comportamiento de los endpoints** bajo diferentes cargas de trabajo, simulando escenarios reales de uso del sistema.

**Tecnología:** Locust + MySQL  
**Ubicación:** `tests/performance/`  
**Escenarios:** carga baja, media y alta  

**Características:**
- Simulación de usuarios concurrentes
- Medición de latencia y throughput
- Identificación de cuellos de botella

**Ejecución:**

Se debe garantizar con anterioridad el despliegue del servidor de base de datos.

```bash
# Usando Makefile
make locust-intro
make server-test # Inicializa base de datos de pruebas y ejecuta servidor uvicorn
make locust-low
make locust-medium
make locust-high
```

## Instalación y Configuración

### Requisitos Previos

- Python 3.8 o superior
- MySQL Server
- Git
- GNU Make 4.0 o superior

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd sonyco-backend
```

### 2. Crear Entorno Virtual

Se recomienda usar un entorno virtual para aislar dependencias:

```bash
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate      # Windows
```

### 3. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar Variables de Entorno dev y test

Crea un archivo `.env.dev` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL=mysql+mysqlconnector://usuario:password@localhost:3306/sonyco_db
SECRET_KEY=tu_clave_secreta_muy_segura
ENTORNO=dev
```
Crea un archivo `.env.test` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL=mysql+mysqlconnector://usuario:password@localhost:3306/sonyco_db_test
SECRET_KEY=tu_clave_secreta_muy_segura
ENTORNO=test
```

### 5. Configurar Base de Datos

Asegúrate de tener MySQL Server ejecutándose y crea la base de datos:

```sql
CREATE DATABASE sonyco_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

## Ejecución

### Levantar el Servidor

```bash
# Método tradicional
uvicorn app.main:app --reload

# Usando Makefile
make dev
```

La aplicación estará disponible en `http://localhost:8000`

### Poblar la Base de Datos con Datos Iniciales

```bash
# Método tradicional
python -m app.db.seed

# Usando Makefile
make seed-dev
```

### Reiniciar la Base de Datos

**⚠️ ATENCIÓN: Esto eliminará todos los datos actuales**

En el archivo `app/db/init_db.py`, descomenta la línea 23:

```python
# SQLModel.metadata.drop_all(engine)   # elimina todas las tablas
```

Ejecuta la aplicación y luego vuelve a comentar la línea para evitar eliminaciones accidentales en futuros runs.

## Documentación de la API

FastAPI genera automáticamente la documentación interactiva de la API:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Tecnologías Utilizadas

- **FastAPI**: Framework web moderno y de alto rendimiento
- **SQLModel**: ORM moderno basado en SQLAlchemy y Pydantic
- **Pydantic**: Validación y serialización de datos
- **MySQL**: Sistema de gestión de base de datos relacional
- **Uvicorn**: Servidor ASGI de alto rendimiento

## Estructura de Datos

El sistema gestiona las siguientes entidades principales:

- Usuarios
- Clientes
- Productos
- Categorias
- Inventarios
- Movimientos
- Ventas
- Detalles de venta
- Exportación

## Contacto

Para más información sobre el proyecto o reporte de alguna incosistencia, por favor, contáctame: andresfma.dev@gmail.com