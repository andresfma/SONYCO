from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional

from app.db.session import get_session
from app.schemas.usuario import UsuarioRead, UsuarioCreate, UsuarioUpdate
from app.schemas.shared import PagedResponse
from app.services.usuario_service import (
    get_usuarios,
    get_usuario_by_id,
    create_usuario,
    update_usuario,
    delete_usuario,
    UsuarioExistsError,
    change_estado_usuario
)
from app.api.dependencies import get_current_admin_user

router = APIRouter()

@router.get("/", response_model=PagedResponse[UsuarioRead], summary="Listar usuarios con búsqueda, filtro por estado y paginación")
def listar_usuarios(
    db: Session = Depends(get_session),
    page: int = Query(1, ge=1, description="Número de página (comienza en 1)"),
    page_size: int = Query(50, ge=1, le=100, description="Elementos por página"),
    search: Optional[str] = Query(None, description="Buscar por nombre o correo del usuario"),
    sort_by: Optional[str] = Query(None, description="Columna para ordenar"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Orden ascendente o descendente"),
    estado: Optional[bool] = Query(None, description="Filtrar por estado del usuario (true=activo, false=inactivo)"),
    admin=Depends(get_current_admin_user)
):
    return get_usuarios(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        estado=estado
    )


@router.get("/{usuario_id}", response_model=UsuarioRead, summary="Obtener un usuario por ID")
def obtener_usuario(
    usuario_id: int, 
    db: Session = Depends(get_session), 
    admin=Depends(get_current_admin_user)
    ):
    usuario = get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.post("/", response_model=UsuarioRead, summary="Crear un nuevo usuario", status_code=status.HTTP_201_CREATED)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_session), admin=Depends(get_current_admin_user)):
    try:
        return create_usuario(db, usuario)
    except UsuarioExistsError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{usuario_id}", response_model=UsuarioRead, summary="Actualizar usuario existente")
def actualizar_usuario(usuario_id: int, datos: UsuarioUpdate, db: Session = Depends(get_session), admin=Depends(get_current_admin_user)):
    usuario_actualizado = update_usuario(db, usuario_id, datos)
    if not usuario_actualizado:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario_actualizado


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar un usuario")
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_session), admin=Depends(get_current_admin_user)):
    return delete_usuario(db, usuario_id)


@router.patch("/{usuario_id}/estado", response_model=UsuarioRead, summary="Cambiar estado del Usuario")
def cambiar_estado_usuario(
    usuario_id: int,
    db: Session = Depends(get_session),
    admin=Depends(get_current_admin_user)
):
    return change_estado_usuario(db, usuario_id)
