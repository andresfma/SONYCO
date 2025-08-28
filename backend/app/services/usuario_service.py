from sqlmodel import Session, select
from sqlalchemy import func, or_, asc, desc
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioRead
from app.schemas.shared import PagedResponse 
from app.core.security import get_password_hash
from typing import Optional, List
from fastapi import HTTPException


class UsuarioExistsError(Exception):
    """Excepción personalizada para indicar que el usuario ya existe."""
    pass


def get_usuario_by_email(db: Session, email: str) -> Optional[Usuario]:
    """Obtiene un usuario por su email."""
    statement = select(Usuario).where(Usuario.email == email)
    return db.exec(statement).first()


def get_usuario_by_id(db: Session, usuario_id: int) -> Optional[Usuario]:
    """Obtiene un usuario por su ID."""
    return db.get(Usuario, usuario_id)


def get_usuarios(
    db: Session,
    page: int = 1,
    page_size: int = 50,
    search: Optional[str] = None,
    estado: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> PagedResponse[UsuarioRead]:
    """
    Obtiene usuarios con filtros, paginación y ordenamiento.
    Filtros disponibles:
      - search: busca en nombre y correo.
      - estado: filtra por estado activo/inactivo.
    Soporta ordenamiento dinámico mediante sort_by y sort_order.
    """

    # Construir filtros comunes para ambas consultas
    filters = []

    if search:
        filters.append(
            or_(
                Usuario.nombre.ilike(f"%{search}%"),
                Usuario.email.ilike(f"%{search}%")
            )
        )

    if estado is not None:
        filters.append(Usuario.estado == estado)

    # Consulta para contar total
    count_stmt = select(func.count(Usuario.id))
    if filters:
        count_stmt = count_stmt.where(*filters)
    total = db.exec(count_stmt).one()

    # Calcular páginas
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    # Consulta para obtener los usuarios
    statement = select(Usuario)
    if filters:
        statement = statement.where(*filters)

    # Ordenamiento dinámico
    if sort_by:
        col = None
        if hasattr(Usuario, sort_by):
            col = getattr(Usuario, sort_by)

        if col is not None:
            statement = statement.order_by(
                asc(col) if sort_order == "asc" else desc(col)
            )

    # Paginación
    statement = statement.offset(offset).limit(page_size)

    usuarios = db.exec(statement).all()

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=usuarios
    )


def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    """Crea un nuevo usuario en la base de datos."""
    # Verificar si el usuario ya existe
    existing = db.exec(select(Usuario).where(Usuario.email == usuario.email)).first()
    if existing:
        raise UsuarioExistsError(f"El usuario con email {usuario.email} ya existe.")
    
    # Crear un nuevo usuario
    hashed_password = get_password_hash(usuario.contrasena)

    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        contrasena=hashed_password,
        rol_id=usuario.rol_id
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


def update_usuario(db: Session, usuario_id: int, datos: UsuarioUpdate) -> Optional[Usuario]:
    """Actualiza un usuario existente en la base de datos."""
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if datos.nombre is not None:
        usuario.nombre = datos.nombre
    # Verificar si el email ya está en uso
    if datos.email is not None and datos.email != usuario.email:
        existing = db.exec(select(Usuario).where(Usuario.email == datos.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail=(f"El usuario con email {datos.email} ya existe."))
        usuario.email = datos.email
    if datos.contrasena is not None:
        usuario.contrasena = get_password_hash(datos.contrasena)
    if datos.rol_id is not None:
        usuario.rol_id = datos.rol_id
    if datos.estado is not None:
        usuario.estado = datos.estado

    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def delete_usuario(db: Session, usuario_id: int) -> bool:
    """Elimina un usuario de la base de datos."""
    usuario = db.get(Usuario, usuario_id)
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Relaciones que bloquean el borrado
    if usuario.ventas or usuario.movimientos:
        raise HTTPException(status_code=400, detail="No se puede eliminar, tiene relaciones activas")

    # Eliminar el usuario
    db.delete(usuario)
    db.commit()

    return True


def change_estado_usuario(db: Session, usuario_id: int) -> UsuarioRead:
    """Desactiva un usuario en la base de datos."""
    usuario = db.get(Usuario, usuario_id)
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Alternar el estado del usuario
    usuario.estado = not usuario.estado

    db.commit()
    db.refresh(usuario)

    return usuario
    
