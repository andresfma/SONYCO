from sqlmodel import Session, select
from sqlalchemy import func, or_, distinct, asc, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pydantic import EmailStr 
from fastapi import HTTPException, status

from app.models.cliente import Cliente, TipoPersona
from app.models.venta import Venta
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteRead, ClienteVentasResponse, ClienteReadSimple
from app.schemas.shared import PagedResponse

class ClienteExistsError(Exception):
    """Excepción personalizada para indicar que el cliente ya existe."""
    pass


def get_clientes(
    db: Session,
    page: int = 1,
    page_size: int = 50,
    search: Optional[str] = None,
    tipo_persona: Optional[TipoPersona] = None,
    estado: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> PagedResponse[ClienteRead]:
    """
    Obtiene clientes con filtros, paginación y ordenamiento.
    Filtros disponibles:
      - search: busca en nombre, identificación y correo.
      - tipo_persona: filtra por tipo de persona.
      - estado: filtra por estado activo/inactivo.
    Soporta ordenamiento dinámico mediante sort_by y sort_order.
    """

    # Construir filtros comunes para ambas consultas
    filters = []

    if search:
        filters.append(
            or_(
                Cliente.nombre.ilike(f"%{search}%"),
                Cliente.identificacion.ilike(f"%{search}%"),
                Cliente.email.ilike(f"%{search}%")
            )
        )

    if tipo_persona:
        filters.append(Cliente.tipo_persona == tipo_persona)

    if estado is not None:
        filters.append(Cliente.estado == estado)

    # Consulta para contar total
    count_stmt = select(func.count(Cliente.id))
    if filters:
        count_stmt = count_stmt.where(*filters)
    total = db.exec(count_stmt).one()

    # Calcular páginas
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    # Consulta para obtener los clientes
    statement = select(Cliente)
    if filters:
        statement = statement.where(*filters)

    # Ordenamiento dinámico
    if sort_by:
        col = None
        if hasattr(Cliente, sort_by):
            col = getattr(Cliente, sort_by)

        if col is not None:
            statement = statement.order_by(
                asc(col) if sort_order == "asc" else desc(col)
            )

    # Paginación
    statement = statement.offset(offset).limit(page_size)

    clientes = db.exec(statement).all()

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=clientes
    )


def get_cliente_by_email(db: Session, email: EmailStr) -> Optional[ClienteRead]:
    """Obtiene un cliente por su email."""
    return db.exec(select(Cliente).where(Cliente.email == email)).first()


def get_cliente_by_id(db: Session, cliente_id: int) -> Optional[ClienteRead]:
    """Obtiene un cliente por su ID."""
    return db.get(Cliente, cliente_id)


def get_cliente_by_identificacion(db: Session, identificacion: str) -> Optional[ClienteRead]:
    """Obtiene un cliente por su ID."""
    return db.exec(select(Cliente).where(Cliente.identificacion == identificacion)).first()


def create_cliente(db: Session, cliente_create: ClienteCreate) -> ClienteRead:
    """Crea un nuevo cliente."""
    
    if get_cliente_by_email(db, cliente_create.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El cliente con email '{cliente_create.email}' ya existe"
        )
    
    if get_cliente_by_identificacion(db, cliente_create.identificacion):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El cliente con identificación '{cliente_create.identificacion}' ya existe"
        )
    
    cliente = Cliente.model_validate(cliente_create)
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


def update_cliente(db: Session, cliente_id: int, cliente_update: ClienteUpdate) -> Optional[ClienteRead]:
    """Actualiza un cliente existente."""
    cliente = db.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado."
        )

    
    # Verificar si el email ya existe
    if cliente_update.email and cliente_update.email != cliente.email:
        existing_cliente = get_cliente_by_email(db, cliente_update.email)
        if existing_cliente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un cliente con este email."
            )
    
    # Verificar si identificación ya existe
    if cliente_update.identificacion and cliente_update.identificacion != cliente.identificacion:
        existing_cliente = get_cliente_by_identificacion(db, cliente_update.identificacion)
        if existing_cliente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un cliente con esta identificación."
            )

    update_data = cliente_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(cliente, key, value)

    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


def delete_cliente(db: Session, cliente_id: int) -> bool:
    """Elimina un cliente por su ID."""
    cliente = db.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Relaciones que bloquean el borrado
    if cliente.ventas:
        raise HTTPException(status_code=400, detail="No se puede eliminar, tiene relaciones activas")

    # Eliminar el cliente
    db.delete(cliente)
    db.commit()

    return True


def change_estado_cliente(db: Session, cliente_id: int) -> ClienteRead:
    """Desactiva un cliente en la base de datos."""
    cliente = db.get(Cliente, cliente_id)
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Alternar el estado del usuario
    cliente.estado = not cliente.estado

    db.commit()
    db.refresh(cliente)

    return ClienteRead.model_validate(cliente)


def get_numero_clientes_con_ventas(db: Session) -> ClienteVentasResponse:
    """
    Devuelve el número de clientes que tienen al menos una venta registrada.
    """
    total = db.exec(
        select(func.count(distinct(Venta.cliente_id)))
    ).one_or_none()

    cantidad = total if total and total is not None else 0

    return ClienteVentasResponse(total=cantidad)


def get_clientes_infinito(
    db: Session,
    skip: int = 0,     
    limit: int = 50,
    search: Optional[str] = None
) -> List[ClienteReadSimple]:
    """
    Obtiene clientes activos para infinite scroll.
    Devuelve solo id y nombre.
    """
    statement = select(Cliente)
    
    #filtro nombre
    if search:
        statement = statement.where(Cliente.nombre.ilike(f"%{search}%"))

    # Solo entidades activas
    statement = statement.where(Cliente.estado == True)

    # Orden alfabetico por nombre
    statement = statement.order_by(Cliente.nombre).offset(skip).limit(limit)

    rows = db.exec(statement).all()

    return [ClienteReadSimple.model_validate(row) for row in rows]