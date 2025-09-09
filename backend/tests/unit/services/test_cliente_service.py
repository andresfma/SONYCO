import pytest
from unittest.mock import Mock
from fastapi import HTTPException
from sqlmodel import Session
from pydantic import EmailStr

from app.models.cliente import Cliente, TipoPersona
from app.models.venta import Venta
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteReadSimple, ClienteVentasResponse
from app.services.cliente_service import (
    get_clientes,
    get_cliente_by_email,
    get_cliente_by_id,
    get_cliente_by_identificacion,
    create_cliente,
    update_cliente,
    delete_cliente,
    change_estado_cliente,
    get_numero_clientes_con_ventas,
    get_clientes_infinito
)


class TestGetClientes:
    """Tests para la función get_clientes"""
    
    def test_get_clientes_sin_filtros(self, session: Session, clientes_fixture):
        """Test obtener todos los clientes sin filtros"""
        result = get_clientes(session)
        
        assert result.total == 2
        assert result.current_page == 1
        assert result.page_size == 50
        assert len(result.items) == 2
        assert result.total_pages == 1
    
    def test_get_clientes_con_paginacion(self, session: Session, clientes_fixture):
        """Test paginación de clientes"""
        result = get_clientes(session, page=1, page_size=1)
        
        assert result.total == 2
        assert result.current_page == 1
        assert result.page_size == 1
        assert len(result.items) == 1
        assert result.total_pages == 2
    
    def test_get_clientes_filtro_search_nombre(self, session: Session, clientes_fixture):
        """Test filtro por búsqueda en nombre"""
        result = get_clientes(session, search="Juan")
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].nombre == "Juan Pérez"
    
    def test_get_clientes_filtro_search_email(self, session: Session, clientes_fixture):
        """Test filtro por búsqueda en email"""
        result = get_clientes(session, search="contacto@xyz.com")
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].email == "contacto@xyz.com"
    
    def test_get_clientes_filtro_search_identificacion(self, session: Session, clientes_fixture):
        """Test filtro por búsqueda en identificación"""
        result = get_clientes(session, search="J12345678")
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].identificacion == "J12345678"
    
    def test_get_clientes_filtro_tipo_persona(self, session: Session, clientes_fixture):
        """Test filtro por tipo de persona"""
        result = get_clientes(session, tipo_persona=TipoPersona.natural)
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].tipo_persona == TipoPersona.natural
    
    def test_get_clientes_filtro_estado_activo(self, session: Session, clientes_fixture):
        """Test filtro por estado activo"""
        # Crear cliente inactivo
        cliente_inactivo = Cliente(
            nombre="Cliente Inactivo",
            email="inactivo@example.com",
            tipo_persona=TipoPersona.natural,
            identificacion="9999999999",
            estado=False
        )
        session.add(cliente_inactivo)
        session.commit()
        
        result = get_clientes(session, estado=True)
        
        assert result.total == 2  # Solo los activos
        assert all(item.estado for item in result.items)
    
    def test_get_clientes_ordenamiento_asc(self, session: Session, clientes_fixture):
        """Test ordenamiento ascendente"""
        result = get_clientes(session, sort_by="nombre", sort_order="asc")
        
        nombres = [item.nombre for item in result.items]
        assert nombres == sorted(nombres)
    
    def test_get_clientes_ordenamiento_desc(self, session: Session, clientes_fixture):
        """Test ordenamiento descendente"""
        result = get_clientes(session, sort_by="nombre", sort_order="desc")
        
        nombres = [item.nombre for item in result.items]
        assert nombres == sorted(nombres, reverse=True)
    
    def test_get_clientes_sin_resultados(self, session: Session):
        """Test cuando no hay clientes"""
        result = get_clientes(session)
        
        assert result.total == 0
        assert result.current_page == 1
        assert result.total_pages == 1
        assert len(result.items) == 0


class TestGetClienteBy:
    """Tests para las funciones get_cliente_by_*"""
    
    def test_get_cliente_by_email_existente(self, session: Session, cliente_fixture):
        """Test obtener cliente por email existente"""
        result = get_cliente_by_email(session, "juan@example.com")
        
        assert result is not None
        assert result.email == "juan@example.com"
        assert result.nombre == "Juan Pérez"
    
    def test_get_cliente_by_email_no_existente(self, session: Session):
        """Test obtener cliente por email no existente"""
        result = get_cliente_by_email(session, "noexiste@example.com")
        
        assert result is None
    
    def test_get_cliente_by_id_existente(self, session: Session, cliente_fixture):
        """Test obtener cliente por ID existente"""
        result = get_cliente_by_id(session, cliente_fixture.id)
        
        assert result is not None
        assert result.id == cliente_fixture.id
        assert result.nombre == "Juan Pérez"
    
    def test_get_cliente_by_id_no_existente(self, session: Session):
        """Test obtener cliente por ID no existente"""
        result = get_cliente_by_id(session, 9999)
        
        assert result is None
    
    def test_get_cliente_by_identificacion_existente(self, session: Session, cliente_fixture):
        """Test obtener cliente por identificación existente"""
        result = get_cliente_by_identificacion(session, "1234567890")
        
        assert result is not None
        assert result.identificacion == "1234567890"
        assert result.nombre == "Juan Pérez"
    
    def test_get_cliente_by_identificacion_no_existente(self, session: Session):
        """Test obtener cliente por identificación no existente"""
        result = get_cliente_by_identificacion(session, "0000000000")
        
        assert result is None


class TestCreateCliente:
    """Tests para la función create_cliente"""
    
    def test_create_cliente_exitoso(self, session: Session):
        """Test crear cliente exitosamente"""
        cliente_data = ClienteCreate(
            nombre="Nuevo Cliente",
            email="nuevo@example.com",
            telefono="555123456",
            direccion="Nueva Dirección 123",
            tipo_persona=TipoPersona.natural,
            identificacion="5555555555"
        )
        
        result = create_cliente(session, cliente_data)
        
        assert result.id is not None
        assert result.nombre == "Nuevo Cliente"
        assert result.email == "nuevo@example.com"
        assert result.estado is True
    
    def test_create_cliente_email_duplicado(self, session: Session, cliente_fixture):
        """Test error al crear cliente con email duplicado"""
        cliente_data = ClienteCreate(
            nombre="Cliente Duplicado",
            email="juan@example.com",  # Email ya existe
            tipo_persona=TipoPersona.natural,
            identificacion="9999999999"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            create_cliente(session, cliente_data)
        
        assert exc_info.value.status_code == 409
        assert "El cliente con email 'juan@example.com' ya existe" in str(exc_info.value.detail)
    
    def test_create_cliente_identificacion_duplicado(self, session: Session, cliente_fixture):
        """Test error al crear cliente con identificación duplicada"""
        cliente_data = ClienteCreate(
            nombre="Cliente Duplicado",
            email="correonuevoeinexistente@example.com",  # Email ya existe
            tipo_persona=TipoPersona.natural,
            identificacion="1234567890"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            create_cliente(session, cliente_data)
        
        assert exc_info.value.status_code == 409
        assert "El cliente con identificación '1234567890' ya existe" in str(exc_info.value.detail)
    
    def test_create_cliente_campos_opcionales_none(self, session: Session):
        """Test crear cliente con campos opcionales None"""
        cliente_data = ClienteCreate(
            nombre="Cliente Minimal",
            email="minimal@example.com",
            tipo_persona=TipoPersona.natural,
            identificacion="1111111111"
        )
        
        result = create_cliente(session, cliente_data)
        
        assert result.telefono is None
        assert result.direccion is None
        assert result.estado is True


class TestUpdateCliente:
    """Tests para la función update_cliente"""
    
    def test_update_cliente_exitoso(self, session: Session, cliente_fixture):
        """Test actualizar cliente exitosamente"""
        update_data = ClienteUpdate(
            nombre="Juan Pérez Actualizado",
            telefono="999888777"
        )
        
        result = update_cliente(session, cliente_fixture.id, update_data)
        
        assert result.nombre == "Juan Pérez Actualizado"
        assert result.telefono == "999888777"
        assert result.email == "juan@example.com"  # No cambiado
    
    def test_update_cliente_no_existente(self, session: Session):
        """Test error al actualizar cliente no existente"""
        update_data = ClienteUpdate(nombre="No Existe")
        
        with pytest.raises(HTTPException) as exc_info:
            update_cliente(session, 9999, update_data)
        
        assert exc_info.value.status_code == 404
        assert "Cliente no encontrado" in str(exc_info.value.detail)
    
    def test_update_cliente_email_duplicado(self, session: Session, clientes_fixture):
        """Test error al actualizar con email duplicado"""
        cliente1, cliente2 = clientes_fixture
        
        update_data = ClienteUpdate(email="contacto@xyz.com")  # Email del cliente2
        
        with pytest.raises(HTTPException) as exc_info:
            update_cliente(session, cliente1.id, update_data)
        
        assert exc_info.value.status_code == 400
        assert "Ya existe un cliente con este email" in str(exc_info.value.detail)
    
    def test_update_cliente_identificacion_duplicada(self, session: Session, clientes_fixture):
        """Test error al actualizar con identificación duplicada"""
        cliente1, cliente2 = clientes_fixture
        
        update_data = ClienteUpdate(identificacion="J12345678")  # Identificación del cliente2
        
        with pytest.raises(HTTPException) as exc_info:
            update_cliente(session, cliente1.id, update_data)
        
        assert exc_info.value.status_code == 400
        assert "Ya existe un cliente con esta identificación" in str(exc_info.value.detail)
    
    def test_update_cliente_mismo_email(self, session: Session, cliente_fixture):
        """Test actualizar cliente con su mismo email no debe dar error"""
        update_data = ClienteUpdate(
            email="juan@example.com",  # Su mismo email
            nombre="Nuevo Nombre"
        )
        
        result = update_cliente(session, cliente_fixture.id, update_data)
        
        assert result.email == "juan@example.com"
        assert result.nombre == "Nuevo Nombre"


class TestDeleteCliente:
    """Tests para la función delete_cliente"""
    
    def test_delete_cliente_exitoso(self, session: Session, cliente_fixture):
        """Test eliminar cliente sin relaciones"""
        result = delete_cliente(session, cliente_fixture.id)
        
        assert result is True
        
        # Verificar que fue eliminado
        cliente_eliminado = get_cliente_by_id(session, cliente_fixture.id)
        assert cliente_eliminado is None
    
    def test_delete_cliente_no_existente(self, session: Session):
        """Test error al eliminar cliente no existente"""
        with pytest.raises(HTTPException) as exc_info:
            delete_cliente(session, 9999)
        
        assert exc_info.value.status_code == 404
        assert "Cliente no encontrado" in str(exc_info.value.detail)
    
    def test_delete_cliente_con_ventas(self, session: Session, cliente_fixture, usuario_fixture):
        """Test error al eliminar cliente con ventas"""
        # Crear una venta asociada al cliente
        venta = Venta(cliente_id=cliente_fixture.id, usuario_id=usuario_fixture.id, total=100.0)
        session.add(venta)
        session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            delete_cliente(session, cliente_fixture.id)
        
        assert exc_info.value.status_code == 400
        assert "No se puede eliminar, tiene relaciones activas" in str(exc_info.value.detail)


class TestChangeEstadoCliente:
    """Tests para la función change_estado_cliente"""
    
    def test_change_estado_cliente_desactivar(self, session: Session, cliente_fixture):
        """Test cambiar estado de activo a inactivo"""
        assert cliente_fixture.estado is True
        
        result = change_estado_cliente(session, cliente_fixture.id)
        
        assert result.estado is False
    
    def test_change_estado_cliente_activar(self, session: Session):
        """Test cambiar estado de inactivo a activo"""
        # Crear cliente inactivo
        cliente_inactivo = Cliente(
            nombre="Cliente Inactivo",
            email="inactivo@example.com",
            tipo_persona=TipoPersona.natural,
            identificacion="9999999999",
            estado=False
        )
        session.add(cliente_inactivo)
        session.commit()
        session.refresh(cliente_inactivo)
        
        result = change_estado_cliente(session, cliente_inactivo.id)
        
        assert result.estado is True
    
    def test_change_estado_cliente_no_existente(self, session: Session):
        """Test error al cambiar estado de cliente no existente"""
        with pytest.raises(HTTPException) as exc_info:
            change_estado_cliente(session, 9999)
        
        assert exc_info.value.status_code == 404
        assert "Cliente no encontrado" in str(exc_info.value.detail)


class TestGetNumeroClientesConVentas:
    """Tests para la función get_numero_clientes_con_ventas"""
    
    def test_get_numero_clientes_con_ventas_sin_ventas(self, session: Session, clientes_fixture):
        """Test contar clientes con ventas cuando no hay ventas"""
        result = get_numero_clientes_con_ventas(session)
        
        assert isinstance(result, ClienteVentasResponse)
        assert result.total == 0
    
    def test_get_numero_clientes_con_ventas_con_ventas(self, session: Session, clientes_fixture, usuario_fixture):
        """Test contar clientes con ventas"""
        cliente1, cliente2 = clientes_fixture
        
        # Crear ventas para ambos clientes
        venta1 = Venta(cliente_id=cliente1.id, usuario_id=usuario_fixture.id, total=100.0)
        venta2 = Venta(cliente_id=cliente2.id, usuario_id=usuario_fixture.id, total=200.0)
        venta3 = Venta(cliente_id=cliente1.id, usuario_id=usuario_fixture.id, total=150.0)  # Otra venta del mismo cliente
        
        session.add_all([venta1, venta2, venta3])
        session.commit()
        
        result = get_numero_clientes_con_ventas(session)
        
        assert result.total == 2  # 2 clientes distintos con ventas
    
    def test_get_numero_clientes_con_ventas_tabla_vacia(self, session: Session):
        """Test contar clientes con ventas cuando no hay datos"""
        result = get_numero_clientes_con_ventas(session)
        
        assert result.total == 0


class TestGetClientesInfinito:
    """Tests para la función get_clientes_infinito"""
    
    def test_get_clientes_infinito_sin_filtros(self, session: Session, clientes_fixture):
        """Test obtener clientes para scroll infinito sin filtros"""
        result = get_clientes_infinito(session)
        
        assert len(result) == 2
        assert all(isinstance(cliente, ClienteReadSimple) for cliente in result)
        assert all(hasattr(cliente, 'id') and hasattr(cliente, 'nombre') for cliente in result)
        
        # Verificar orden alfabético
        nombres = [cliente.nombre for cliente in result]
        assert nombres == sorted(nombres)
    
    def test_get_clientes_infinito_con_search(self, session: Session, clientes_fixture):
        """Test filtro de búsqueda en scroll infinito"""
        result = get_clientes_infinito(session, search="Juan")
        
        assert len(result) == 1
        assert result[0].nombre == "Juan Pérez"
    
    def test_get_clientes_infinito_solo_activos(self, session: Session, clientes_fixture):
        """Test que solo devuelve clientes activos"""
        # Crear cliente inactivo
        cliente_inactivo = Cliente(
            nombre="Cliente Inactivo",
            email="inactivo@example.com",
            tipo_persona=TipoPersona.natural,
            identificacion="9999999999",
            estado=False
        )
        session.add(cliente_inactivo)
        session.commit()
        
        result = get_clientes_infinito(session)
        
        assert len(result) == 2  # Solo los activos
        nombres = [cliente.nombre for cliente in result]
        assert "Cliente Inactivo" not in nombres
    
    def test_get_clientes_infinito_paginacion(self, session: Session, clientes_fixture):
        """Test paginación en scroll infinito"""
        result_page1 = get_clientes_infinito(session, skip=0, limit=1)
        result_page2 = get_clientes_infinito(session, skip=1, limit=1)
        
        assert len(result_page1) == 1
        assert len(result_page2) == 1
        assert result_page1[0].id != result_page2[0].id
    
    def test_get_clientes_infinito_vacio(self, session: Session):
        """Test scroll infinito cuando no hay clientes"""
        result = get_clientes_infinito(session)
        
        assert len(result) == 0
        assert isinstance(result, list)