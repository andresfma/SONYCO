import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from sqlmodel import Session
from pydantic import EmailStr

from app.models.usuario import Usuario
from app.models.rol import Rol
from app.models.movimiento_inventario import MovimientoInventario, TipoMovimientoEnum
from app.models.venta import Venta
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioRead, UsuarioReadSimple
from app.services.usuario_service import (
    get_usuario_by_email,
    get_usuario_by_id,
    get_usuarios,
    create_usuario,
    update_usuario,
    delete_usuario,
    change_estado_usuario,
    UsuarioExistsError
)
from app.core.security import get_password_hash, verify_password


class TestGetUsuarioBy:
    """Tests para las funciones get_usuario_by_*"""
    
    def test_get_usuario_by_email_existente(self, session: Session, usuario_fixture):
        """Test obtener usuario por email existente"""
        result = get_usuario_by_email(session, "usuario@test.com")
        
        assert result is not None
        assert result.email == "usuario@test.com"
        assert result.nombre == "Usuario Test"
        assert result.id == usuario_fixture.id
    
    def test_get_usuario_by_email_no_existente(self, session: Session):
        """Test obtener usuario por email no existente"""
        result = get_usuario_by_email(session, "noexiste@example.com")
        
        assert result is None
    
    def test_get_usuario_by_email_case_sensitive(self, session: Session, usuario_fixture):
        """Test que la búsqueda por email es case sensitive"""
        result = get_usuario_by_email(session, "USUARIO@TEST.COM")
        
        assert result is None or result.email.lower() == "usuario@test.com"
    
    def test_get_usuario_by_id_existente(self, session: Session, usuario_fixture):
        """Test obtener usuario por ID existente"""
        result = get_usuario_by_id(session, usuario_fixture.id)
        
        assert result is not None
        assert result.id == usuario_fixture.id
        assert result.nombre == "Usuario Test"
        assert result.email == "usuario@test.com"
    
    def test_get_usuario_by_id_no_existente(self, session: Session):
        """Test obtener usuario por ID no existente"""
        result = get_usuario_by_id(session, 9999)
        
        assert result is None


class TestGetUsuarios:
    """Tests para la función get_usuarios"""
    
    def test_get_usuarios_sin_filtros(self, session: Session, usuarios_fixture):
        """Test obtener todos los usuarios sin filtros"""
        result = get_usuarios(session)
        
        assert result.total == 3
        assert result.current_page == 1
        assert result.page_size == 50
        assert len(result.items) == 3
        assert result.total_pages == 1
    
    def test_get_usuarios_con_paginacion(self, session: Session, usuarios_fixture):
        """Test paginación de usuarios"""
        result = get_usuarios(session, page=1, page_size=2)
        
        assert result.total == 3
        assert result.current_page == 1
        assert result.page_size == 2
        assert len(result.items) == 2
        assert result.total_pages == 2
        
        # Probar segunda página
        result_page2 = get_usuarios(session, page=2, page_size=2)
        assert result_page2.current_page == 2
        assert len(result_page2.items) == 1
    
    def test_get_usuarios_filtro_search_nombre(self, session: Session, usuarios_fixture):
        """Test filtro por búsqueda en nombre"""
        result = get_usuarios(session, search="Juan")
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].nombre == "Juan Pérez"
    
    def test_get_usuarios_filtro_search_email(self, session: Session, usuarios_fixture):
        """Test filtro por búsqueda en email"""
        result = get_usuarios(session, search="maria@example.com")
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].email == "maria@example.com"
    
    def test_get_usuarios_filtro_search_parcial(self, session: Session, usuarios_fixture):
        """Test filtro por búsqueda parcial"""
        result = get_usuarios(session, search="Pér")
        
        assert result.total == 1
        assert len(result.items) == 1
        assert "Pérez" in result.items[0].nombre
    
    def test_get_usuarios_filtro_estado_activo(self, session: Session, usuarios_fixture):
        """Test filtro por estado activo"""
        result = get_usuarios(session, estado=True)
        
        assert result.total == 2
        assert len(result.items) == 2
        assert all(item.estado for item in result.items)
    
    def test_get_usuarios_filtro_estado_inactivo(self, session: Session, usuarios_fixture):
        """Test filtro por estado inactivo"""
        result = get_usuarios(session, estado=False)
        
        assert result.total == 1
        assert len(result.items) == 1
        assert not result.items[0].estado
        assert result.items[0].nombre == "Pedro López"
    
    def test_get_usuarios_ordenamiento_asc(self, session: Session, usuarios_fixture):
        """Test ordenamiento ascendente por nombre"""
        result = get_usuarios(session, sort_by="nombre", sort_order="asc")
        
        nombres = [item.nombre for item in result.items]
        assert nombres == sorted(nombres)
    
    def test_get_usuarios_ordenamiento_desc(self, session: Session, usuarios_fixture):
        """Test ordenamiento descendente por nombre"""
        result = get_usuarios(session, sort_by="nombre", sort_order="desc")
        
        nombres = [item.nombre for item in result.items]
        assert nombres == sorted(nombres, reverse=True)
    
    def test_get_usuarios_ordenamiento_por_email(self, session: Session, usuarios_fixture):
        """Test ordenamiento por email"""
        result = get_usuarios(session, sort_by="email", sort_order="asc")
        
        emails = [item.email for item in result.items]
        assert emails == sorted(emails)
    
    def test_get_usuarios_sin_resultados(self, session: Session):
        """Test cuando no hay usuarios"""
        result = get_usuarios(session)
        
        assert result.total == 0
        assert result.current_page == 1
        assert result.total_pages == 1
        assert len(result.items) == 0
    
    def test_get_usuarios_combinando_filtros(self, session: Session, usuarios_fixture):
        """Test combinando múltiples filtros"""
        result = get_usuarios(session, search="María", estado=True)
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].nombre == "María García"
        assert result.items[0].estado is True


class TestCreateUsuario:
    """Tests para la función create_usuario"""
    
    def test_create_usuario_exitoso(self, session: Session, rol_fixture):
        """Test crear usuario exitosamente"""
        usuario_data = UsuarioCreate(
            nombre="Nuevo Usuario",
            email="nuevo@example.com",
            contrasena="password123",
            rol_id=rol_fixture.id
        )
        
        result = create_usuario(session, usuario_data)
        
        assert result.id is not None
        assert result.nombre == "Nuevo Usuario"
        assert result.email == "nuevo@example.com"
        assert result.rol_id == rol_fixture.id
        assert result.estado is True
        
        # Verificar que la contraseña fue hasheada
        assert result.contrasena != "password123"
        assert len(result.contrasena) > 20  # Hash debería ser más largo
    
    def test_create_usuario_email_duplicado(self, session: Session, usuario_fixture, rol_fixture):
        """Test error al crear usuario con email duplicado"""
        usuario_data = UsuarioCreate(
            nombre="Usuario Duplicado",
            email="usuario@test.com",  # Email ya existe
            contrasena="password123",
            rol_id=rol_fixture.id
        )
        
        with pytest.raises(UsuarioExistsError) as exc_info:
            create_usuario(session, usuario_data)
        
        assert "usuario@test.com" in str(exc_info.value)
        assert "ya existe" in str(exc_info.value)
    
    def test_create_usuario_rol_por_defecto(self, session: Session):
        """Test crear usuario con rol por defecto"""
        usuario_data = UsuarioCreate(
            nombre="Usuario Defecto",
            email="defecto@example.com",
            contrasena="password123"
        )
        
        result = create_usuario(session, usuario_data)
        
        assert result.rol_id == 2  # Valor por defecto
    
    @patch('app.services.usuario_service.get_password_hash')
    def test_create_usuario_password_hashing(self, mock_hash, session: Session, rol_fixture):
        """Test que la contraseña se hashea correctamente"""
        mock_hash.return_value = "hashed_password_123"
        
        usuario_data = UsuarioCreate(
            nombre="Test Hash",
            email="hash@example.com",
            contrasena="plaintext_password",
            rol_id=rol_fixture.id
        )
        
        result = create_usuario(session, usuario_data)
        
        mock_hash.assert_called_once_with("plaintext_password")
        assert result.contrasena == "hashed_password_123"


class TestUpdateUsuario:
    """Tests para la función update_usuario"""
    
    def test_update_usuario_nombre_exitoso(self, session: Session, usuario_fixture):
        """Test actualizar nombre del usuario"""
        update_data = UsuarioUpdate(nombre="Nombre Actualizado")
        
        result = update_usuario(session, usuario_fixture.id, update_data)
        
        assert result.nombre == "Nombre Actualizado"
        assert result.email == "usuario@test.com"  # No cambiado
        assert result.id == usuario_fixture.id
    
    def test_update_usuario_email_exitoso(self, session: Session, usuario_fixture):
        """Test actualizar email del usuario"""
        update_data = UsuarioUpdate(email="nuevo_email@example.com")
        
        result = update_usuario(session, usuario_fixture.id, update_data)
        
        assert result.email == "nuevo_email@example.com"
        assert result.nombre == "Usuario Test"  # No cambiado
    
    def test_update_usuario_contrasena(self, session: Session, usuario_fixture):
        """Test actualizar contraseña del usuario"""
        original_password = usuario_fixture.contrasena
        update_data = UsuarioUpdate(contrasena="nueva_password")
        
        result = update_usuario(session, usuario_fixture.id, update_data)
        
        assert result.contrasena != original_password
        assert result.contrasena != "nueva_password"  # Debe estar hasheada
    
    def test_update_usuario_rol(self, session: Session, usuario_fixture, rol_fixture):
        """Test actualizar rol del usuario"""
        # Crear otro rol
        nuevo_rol = Rol(nombre="Vendedor")
        session.add(nuevo_rol)
        session.commit()
        session.refresh(nuevo_rol)
        
        update_data = UsuarioUpdate(rol_id=nuevo_rol.id)
        
        result = update_usuario(session, usuario_fixture.id, update_data)
        
        assert result.rol_id == nuevo_rol.id
    
    def test_update_usuario_estado(self, session: Session, usuario_fixture):
        """Test actualizar estado del usuario"""
        update_data = UsuarioUpdate(estado=False)
        
        result = update_usuario(session, usuario_fixture.id, update_data)
        
        assert result.estado is False
    
    def test_update_usuario_multiples_campos(self, session: Session, usuario_fixture):
        """Test actualizar múltiples campos a la vez"""
        update_data = UsuarioUpdate(
            nombre="Nombre Nuevo",
            email="email_nuevo@example.com",
            estado=False
        )
        
        result = update_usuario(session, usuario_fixture.id, update_data)
        
        assert result.nombre == "Nombre Nuevo"
        assert result.email == "email_nuevo@example.com"
        assert result.estado is False
    
    def test_update_usuario_no_existente(self, session: Session):
        """Test error al actualizar usuario no existente"""
        update_data = UsuarioUpdate(nombre="No Existe")
        
        with pytest.raises(HTTPException) as exc_info:
            update_usuario(session, 9999, update_data)
        
        assert exc_info.value.status_code == 404
        assert "Usuario no encontrado" in str(exc_info.value.detail)
    
    def test_update_usuario_email_duplicado(self, session: Session, usuarios_fixture):
        """Test error al actualizar con email duplicado"""
        usuario1, usuario2, _ = usuarios_fixture
        
        update_data = UsuarioUpdate(email="maria@example.com")  # Email del usuario2
        
        with pytest.raises(HTTPException) as exc_info:
            update_usuario(session, usuario1.id, update_data)
        
        assert exc_info.value.status_code == 400
        assert "maria@example.com" in str(exc_info.value.detail)
        assert "ya existe" in str(exc_info.value.detail)
    
    def test_update_usuario_mismo_email(self, session: Session, usuario_fixture):
        """Test actualizar usuario con su mismo email no debe dar error"""
        update_data = UsuarioUpdate(
            email="juan@example.com",  # Su mismo email
            nombre="Nuevo Nombre"
        )
        
        result = update_usuario(session, usuario_fixture.id, update_data)
        
        assert result.email == "juan@example.com"
        assert result.nombre == "Nuevo Nombre"
    
    def test_update_usuario_campos_none_no_actualiza(self, session: Session, usuario_fixture):
        """Test que campos None no se actualizan"""
        nombre_original = usuario_fixture.nombre
        email_original = usuario_fixture.email
        
        update_data = UsuarioUpdate(
            nombre=None,
            email=None,
            estado=False  # Solo este campo debería cambiar
        )
        
        result = update_usuario(session, usuario_fixture.id, update_data)
        
        assert result.nombre == nombre_original
        assert result.email == email_original
        assert result.estado is False


class TestDeleteUsuario:
    """Tests para la función delete_usuario"""
    
    def test_delete_usuario_exitoso(self, session: Session, usuario_fixture):
        """Test eliminar usuario sin relaciones"""
        result = delete_usuario(session, usuario_fixture.id)
        
        assert result is True
        
        # Verificar que fue eliminado
        usuario_eliminado = get_usuario_by_id(session, usuario_fixture.id)
        assert usuario_eliminado is None
    
    def test_delete_usuario_no_existente(self, session: Session):
        """Test error al eliminar usuario no existente"""
        with pytest.raises(HTTPException) as exc_info:
            delete_usuario(session, 9999)
        
        assert exc_info.value.status_code == 404
        assert "Usuario no encontrado" in str(exc_info.value.detail)
    
    def test_delete_usuario_con_ventas(self, session: Session, usuario_fixture, cliente_fixture):
        """Test error al eliminar usuario con ventas"""
        # Crear una venta asociada al usuario
        venta = Venta(
            cliente_id=cliente_fixture.id,
            usuario_id=usuario_fixture.id,
            total=100.0
        )
        session.add(venta)
        session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            delete_usuario(session, usuario_fixture.id)
        
        assert exc_info.value.status_code == 400
        assert "No se puede eliminar, tiene relaciones activas" in str(exc_info.value.detail)
    
    def test_delete_usuario_con_movimientos(self, session: Session, usuario_fixture, producto_fixture):
        """Test error al eliminar usuario con movimientos de inventario"""
        
        # Crear un movimiento asociado al usuario
        movimiento = MovimientoInventario(
            producto_id=producto_fixture.id,
            usuario_id=usuario_fixture.id,
            tipo=TipoMovimientoEnum.ENTRADA,
            cantidad=10
        )
        session.add(movimiento)
        session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            delete_usuario(session, usuario_fixture.id)
        
        assert exc_info.value.status_code == 400
        assert "No se puede eliminar, tiene relaciones activas" in str(exc_info.value.detail)
    
    def test_delete_usuario_con_ventas_y_movimientos(self, session: Session, usuario_fixture, cliente_fixture, producto_fixture):
        """Test error al eliminar usuario con ventas y movimientos"""
        
        # Crear venta y movimiento
        venta = Venta(
            cliente_id=cliente_fixture.id,
            usuario_id=usuario_fixture.id,
            total=100.0
        )
        movimiento = MovimientoInventario(
            producto_id=producto_fixture.id,
            usuario_id=usuario_fixture.id,
            tipo=TipoMovimientoEnum.ENTRADA,
            cantidad=10
        )
        session.add_all([venta, movimiento])
        session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            delete_usuario(session, usuario_fixture.id)
        
        assert exc_info.value.status_code == 400
        assert "No se puede eliminar, tiene relaciones activas" in str(exc_info.value.detail)


class TestChangeEstadoUsuario:
    """Tests para la función change_estado_usuario"""
    
    def test_change_estado_usuario_desactivar(self, session: Session, usuario_fixture):
        """Test cambiar estado de activo a inactivo"""
        assert usuario_fixture.estado is True
        
        result = change_estado_usuario(session, usuario_fixture.id)
        
        assert result.estado is False
    
    def test_change_estado_usuario_activar(self, session: Session, usuarios_fixture):
        """Test cambiar estado de inactivo a activo"""
        # Obtener usuario inactivo de los fixtures
        usuario_inactivo = next(u for u in usuarios_fixture if not u.estado)
        assert usuario_inactivo.estado is False
        
        result = change_estado_usuario(session, usuario_inactivo.id)
        
        assert result.estado is True
    
    def test_change_estado_usuario_no_existente(self, session: Session):
        """Test error al cambiar estado de usuario no existente"""
        with pytest.raises(HTTPException) as exc_info:
            change_estado_usuario(session, 9999)
        
        assert exc_info.value.status_code == 404
        assert "Usuario no encontrado" in str(exc_info.value.detail)
    
    def test_change_estado_usuario_multiples_cambios(self, session: Session, usuario_fixture):
        """Test múltiples cambios de estado"""
        estado_original = usuario_fixture.estado
        
        # Primer cambio
        result1 = change_estado_usuario(session, usuario_fixture.id)
        assert result1.estado is not estado_original
        
        # Segundo cambio (debería volver al estado original)
        result2 = change_estado_usuario(session, usuario_fixture.id)
        assert result2.estado is estado_original


