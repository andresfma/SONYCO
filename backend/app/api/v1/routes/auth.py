from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.schemas.auth import LoginRequest, Token
from app.schemas.usuario import UsuarioCreate, UsuarioRead
from app.schemas.shared import ErrorResponse
from app.api.dependencies import get_current_user
from app.models.usuario import Usuario
from app.core.security import verify_password, create_access_token
from app.db.session import get_session
from app.services.usuario_service import (
    get_usuario_by_email, 
    create_usuario, 
    UsuarioExistsError,
    get_usuario_by_id
    )

router = APIRouter()

@router.post(
        "/login", 
        response_model=Token, 
        summary="Iniciar sesión y obtener token JWT",
        responses={
            401: {
                "description": "Credenciales incorrectas o usuario inactivo",
                "model": ErrorResponse,
            }
        }
        )
def login(request: LoginRequest, db: Session = Depends(get_session)):
    """
    Endpoint para autenticar un usuario y generar un token JWT.
    """
    user = get_usuario_by_email(db, request.email) 

    if not user or not verify_password(request.password, user.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    if  not user.estado:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inactivo, contacte al administrador"
        )    

    token = create_access_token({"sub": user.email})

    return {"access_token": token, "token_type": "bearer"}

@router.post("/register", 
             response_model=UsuarioRead, 
             summary="Registrar nuevo usuario",
             responses={
                 409: {
                     "description": "Usuario existente",
                     "model": ErrorResponse,
                 }
             }
             )
def register_user(
    new_user: UsuarioCreate,
    db: Session = Depends(get_session)
):
    """
    Endpoint para registrar un nuevo usuario.
    """
    try:
        return create_usuario(db, new_user)
    except UsuarioExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    
@router.get(
        "/me", 
        response_model=UsuarioRead, 
        summary="Obtener usuario actual",
        responses= {
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            }
        }
        )
def obtener_usuario_actual(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Endpoint para obtener los datos del usuario autenticado.
    """
    return current_user

@router.get(
    "/{user_id}",
    response_model=UsuarioRead,
    summary="Obtener perfil de usuario actual",
    responses={
        404: {
            "description": "Usuario no encontrado",
            "model": ErrorResponse
            },
        401: {
            "description": "No autorizado",
            "model": ErrorResponse
            },
    }
)
def get_perfil_user(
    user_id: int,
    db: Session = Depends(get_session),
    user = Depends(get_current_user)
):
    """
    Endpoint para obtener los datos del usuario actual para mostrar perfil.
    """
    usuario = get_usuario_by_id(db, user_id)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return usuario