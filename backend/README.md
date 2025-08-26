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
├── __init__.py
└── main.py      # Punto de entrada de la aplicación FastAPI
```

## Instalación y Configuración

### Requisitos Previos

- Python 3.8 o superior
- MySQL Server
- Git

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

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL=mysql+mysqlconnector://usuario:password@localhost:3306/sonyco_db
SECRET_KEY=tu_clave_secreta_muy_segura
```

### 5. Configurar Base de Datos

Asegúrate de tener MySQL Server ejecutándose y crea la base de datos:

```sql
CREATE DATABASE sonyco_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

## Ejecución

### Levantar el Servidor

```bash
uvicorn app.main:app --reload
```

La aplicación estará disponible en `http://localhost:8000`

### Poblar la Base de Datos con Datos Iniciales

```bash
python -m app.db.seed
```

### Reiniciar la Base de Datos

**⚠️ ATENCIÓN: Esto eliminará todos los datos actuales**

En el archivo `app/db/init_db.py`, descomenta la línea 27:

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