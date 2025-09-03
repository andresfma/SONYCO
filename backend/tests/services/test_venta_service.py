import pytest
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from unittest.mock import patch
from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.venta import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.cliente import Cliente, TipoPersona
from app.models.usuario import Usuario
from app.models.producto import Producto, UnidadMedida
from app.models.inventario import Inventario
from app.models.movimiento_inventario import MovimientoInventario, TipoMovimientoEnum
from app.models.categoria import Categoria
from app.models.rol import Rol

from app.schemas.venta import (
    VentaRequest, 
    VentaUpdate, 
    VentaTotalResponse, 
)
from app.schemas.detalle_venta import (
    DetalleVentaCreate, 
    DetalleVentaUpdate
)
from app.schemas.shared import PagedResponse
from app.services.venta_service import (
    create_venta, 
    get_venta_by_id, 
    get_ventas, 
    update_venta, 
    delete_venta,
    get_venta_by_cliente_id, 
    get_numero_ventas_ultimos_30_dias, 
    change_estado_venta,
    add_detalle_venta, 
    update_detalle_venta, 
    delete_detalle_venta,
    get_detalles_venta_by_venta_id, 
    get_detalle_venta_by_id
)


# ================================
# PRUEBAS PARA VENTAS
# ================================

class TestCreateVenta:
    """Pruebas para la creación de ventas"""
    
    def test_create_venta_success(self, session: Session, cliente_fixture, usuario_fixture):
        """Test crear venta exitosamente"""
        venta_data = VentaRequest(cliente_id=cliente_fixture.id)
        
        result = create_venta(session, venta_data, usuario_fixture.id)
        
        assert result.id is not None
        assert result.cliente_id == cliente_fixture.id
        assert result.usuario_id == usuario_fixture.id
        assert result.total == Decimal(0)
        assert result.estado is True
        assert result.cliente.id == cliente_fixture.id
        assert result.usuario.id == usuario_fixture.id
        assert isinstance(result.fecha, datetime)

    def test_create_venta_cliente_not_found(self, session: Session, usuario_fixture):
        """Test crear venta con cliente inexistente"""
        venta_data = VentaRequest(cliente_id=99999)
        
        with pytest.raises(HTTPException) as exc_info:
            create_venta(session, venta_data, usuario_fixture.id)
        
        assert exc_info.value.status_code == 404
        assert "Cliente no encontrado" in str(exc_info.value.detail)


class TestGetVentaById:
    """Pruebas para obtener venta por ID"""
    
    def test_get_venta_by_id_success(self, session: Session, venta_fixture):
        """Test obtener venta por ID exitosamente"""
        result = get_venta_by_id(session, venta_fixture.id)
        
        assert result.id == venta_fixture.id
        assert result.cliente_id == venta_fixture.cliente_id
        assert result.usuario_id == venta_fixture.usuario_id
        assert result.cliente is not None
        assert result.usuario is not None

    def test_get_venta_by_id_not_found(self, session: Session):
        """Test obtener venta inexistente"""
        with pytest.raises(HTTPException) as exc_info:
            get_venta_by_id(session, 99999)
        
        assert exc_info.value.status_code == 404
        assert "Venta no encontrada" in str(exc_info.value.detail)


class TestGetVentas:
    """Pruebas para obtener lista de ventas con filtros"""
    
    def test_get_ventas_sin_filtros(self, session: Session, venta_fixture):
        """Test obtener ventas sin filtros"""
        result = get_ventas(session)
        
        assert result.total >= 1
        assert result.current_page == 1
        assert result.page_size == 10
        assert len(result.items) >= 1
        assert any(v.id == venta_fixture.id for v in result.items)

    def test_get_ventas_con_busqueda_por_cliente(self, session: Session, venta_fixture):
        """Test buscar ventas por nombre de cliente"""
        cliente_nombre = venta_fixture.cliente.nombre
        
        result = get_ventas(session, search=cliente_nombre)
        
        assert result.total >= 1
        assert any(v.id == venta_fixture.id for v in result.items)

    def test_get_ventas_filtro_por_estado(self, session: Session, venta_fixture):
        """Test filtrar ventas por estado"""
        result = get_ventas(session, estado=True)
        
        assert result.total >= 1
        assert all(v.estado is True for v in result.items)

    def test_get_ventas_con_paginacion(self, session: Session, venta_fixture):
        """Test paginación de ventas"""
        result = get_ventas(session, page=1, page_size=5)
        
        assert result.current_page == 1
        assert result.page_size == 5
        assert len(result.items) <= 5

    def test_get_ventas_con_ordenamiento(self, session: Session, venta_fixture):
        """Test ordenamiento de ventas"""
        result = get_ventas(session, sort_by="fecha", sort_order="desc")
        
        assert len(result.items) >= 1
        # Verificar que está ordenado por fecha descendente
        if len(result.items) > 1:
            assert result.items[0].fecha >= result.items[1].fecha


class TestUpdateVenta:
    """Pruebas para actualizar ventas"""
    
    def test_update_venta_success(self, session: Session, venta_fixture, cliente_fixture):
        """Test actualizar venta exitosamente"""
        # Crear otro cliente para la prueba
        otro_cliente = Cliente(
            nombre="Otro Cliente",
            email="otro@test.com",
            telefono="987654321",
            direccion="Otra Calle 456",
            tipo_persona=TipoPersona.natural,
            identificacion="0987654321",
            estado=True
        )
        session.add(otro_cliente)
        session.commit()
        session.refresh(otro_cliente)
        
        venta_data = VentaUpdate(cliente_id=otro_cliente.id, estado=False)
        
        result = update_venta(session, venta_fixture.id, venta_data)
        
        assert result.cliente_id == otro_cliente.id
        assert result.estado is False

    def test_update_venta_not_found(self, session: Session):
        """Test actualizar venta inexistente"""
        venta_data = VentaUpdate(estado=False)
        
        with pytest.raises(HTTPException) as exc_info:
            update_venta(session, 99999, venta_data)
        
        assert exc_info.value.status_code == 404

    def test_update_venta_cliente_not_found(self, session: Session, venta_fixture):
        """Test actualizar venta con cliente inexistente"""
        venta_data = VentaUpdate(cliente_id=99999)
        
        with pytest.raises(HTTPException) as exc_info:
            update_venta(session, venta_fixture.id, venta_data)
        
        assert exc_info.value.status_code == 404
        assert "Cliente no encontrado" in str(exc_info.value.detail)


class TestDeleteVenta:
    """Pruebas para eliminar ventas"""
    
    def test_delete_venta_success(self, session: Session, venta_fixture, usuario_fixture):
        """Test eliminar venta sin detalles"""
        result = delete_venta(session, venta_fixture.id, usuario_fixture)
        
        assert result is True
        # Verificar que la venta fue eliminada
        venta_eliminada = session.get(Venta, venta_fixture.id)
        assert venta_eliminada is None

    def test_delete_venta_with_detalles(self, session: Session, detalle_venta_fixture, usuario_fixture):
        """Test eliminar venta con detalles (debe fallar)"""
        venta_id = detalle_venta_fixture.venta_id
        
        with pytest.raises(HTTPException) as exc_info:
            delete_venta(session, venta_id, usuario_fixture)
        
        assert exc_info.value.status_code == 400
        assert "tiene relaciones activas" in str(exc_info.value.detail)

    def test_delete_venta_not_found(self, session: Session, usuario_fixture):
        """Test eliminar venta inexistente"""
        with pytest.raises(HTTPException) as exc_info:
            delete_venta(session, 99999, usuario_fixture)
        
        assert exc_info.value.status_code == 404


class TestGetVentaByClienteId:
    """Pruebas para obtener ventas por cliente"""
    
    def test_get_venta_by_cliente_id_success(self, session: Session, venta_fixture):
        """Test obtener ventas de un cliente"""
        result = get_venta_by_cliente_id(session, venta_fixture.cliente_id)
        
        assert len(result) >= 1
        assert any(v.id == venta_fixture.id for v in result)
        assert all(v.cliente_id == venta_fixture.cliente_id for v in result)

    def test_get_venta_by_cliente_id_not_found(self, session: Session):
        """Test obtener ventas de cliente sin ventas"""
        with pytest.raises(HTTPException) as exc_info:
            get_venta_by_cliente_id(session, 99999)
        
        assert exc_info.value.status_code == 404
        assert "No se encontraron ventas" in str(exc_info.value.detail)


class TestGetNumeroVentasUltimos30Dias:
    """Pruebas para obtener número de ventas en los últimos 30 días"""
    
    @patch('app.services.venta_service.datetime')
    def test_get_numero_ventas_ultimos_30_dias(self, mock_datetime, session: Session, venta_fixture):
        """Test contar ventas de los últimos 30 días"""
        # Mock de la fecha actual
        fecha_actual = datetime.now(timezone.utc)
        mock_datetime.now.return_value = fecha_actual
        
        result = get_numero_ventas_ultimos_30_dias(session)
        
        assert isinstance(result, VentaTotalResponse)
        assert result.total >= 1  # Al menos nuestra venta fixture

    def test_get_numero_ventas_sin_ventas(self, session: Session):
        """Test contar ventas cuando no hay ventas recientes"""
        # Crear sesión limpia sin ventas
        result = get_numero_ventas_ultimos_30_dias(session)
        
        assert isinstance(result, VentaTotalResponse)
        assert result.total >= 0


class TestChangeEstadoVenta:
    """Pruebas para cambiar estado de venta"""
    
    def test_change_estado_venta_success(self, session: Session, venta_fixture):
        """Test cambiar estado de venta"""
        estado_original = venta_fixture.estado
        
        result = change_estado_venta(session, venta_fixture.id)
        
        assert result.estado != estado_original
        assert result.id == venta_fixture.id

    def test_change_estado_venta_not_found(self, session: Session):
        """Test cambiar estado de venta inexistente"""
        with pytest.raises(HTTPException) as exc_info:
            change_estado_venta(session, 99999)
        
        assert exc_info.value.status_code == 404


# ================================
# PRUEBAS PARA DETALLES DE VENTA
# ================================

class TestAddDetalleVenta:
    """Pruebas para agregar detalles a ventas"""
    
    def test_add_detalle_venta_success(self, session: Session, venta_fixture, producto_fixture, 
                                     inventario_fixture, usuario_fixture):
        """Test agregar detalle de venta exitosamente"""

        cantidad_original = inventario_fixture.cantidad

        detalle_data = DetalleVentaCreate(
            producto_id=producto_fixture.id,
            cantidad=3,
            precio_unitario=Decimal("15.00")
        )
        
        result = add_detalle_venta(session, venta_fixture.id, detalle_data, usuario_fixture)
        
        assert len(result.detalle_ventas) >= 1
        assert result.total > 0
        
        # Verificar inventario actualizado
        inventario_updated = session.get(Inventario, inventario_fixture.id)
        assert inventario_updated.cantidad == cantidad_original - 3

        # Verificar que se creó el movimiento
        movimiento = session.exec(
            select(MovimientoInventario)
            .where(MovimientoInventario.producto_id == inventario_fixture.producto_id)
            .where(MovimientoInventario.tipo == TipoMovimientoEnum.VENTA)
        ).first()
        
        assert movimiento is not None
        assert movimiento.cantidad == 3  # Cantidad de detalle venta
        assert movimiento.cantidad_inventario == inventario_fixture.cantidad

    def test_add_detalle_venta_stock_insuficiente(self, session: Session, venta_fixture, 
                                                producto_fixture, inventario_fixture, usuario_fixture):
        """Test agregar detalle con stock insuficiente"""
        detalle_data = DetalleVentaCreate(
            producto_id=producto_fixture.id,
            cantidad=inventario_fixture.cantidad + 1  # Más del stock disponible
        )
        
        with pytest.raises(HTTPException) as exc_info:
            add_detalle_venta(session, venta_fixture.id, detalle_data, usuario_fixture)
        
        assert exc_info.value.status_code == 400
        assert "Stock insuficiente" in str(exc_info.value.detail)

    def test_add_detalle_venta_inventario_not_found(self, session: Session, venta_fixture, usuario_fixture):
        """Test agregar detalle con producto sin inventario"""
        detalle_data = DetalleVentaCreate(
            producto_id=99999,
            cantidad=1
        )
        
        with pytest.raises(HTTPException) as exc_info:
            add_detalle_venta(session, venta_fixture.id, detalle_data, usuario_fixture)
        
        assert exc_info.value.status_code == 404
        assert "Inventario no encontrado" in str(exc_info.value.detail)

    def test_add_detalle_venta_without_precio(self, session: Session, venta_fixture, 
                                            producto_fixture, inventario_fixture, usuario_fixture):
        """Test agregar detalle sin especificar precio (usa precio del producto)"""
        detalle_data = DetalleVentaCreate(
            producto_id=producto_fixture.id,
            cantidad=2
        )
        
        result = add_detalle_venta(session, venta_fixture.id, detalle_data, usuario_fixture)
        
        detalle = result.detalle_ventas[0]
        assert detalle.precio_unitario == producto_fixture.precio_unitario


class TestUpdateDetalleVenta:
    """Pruebas para actualizar detalles de venta"""
    
    def test_update_detalle_venta_cantidad(self, session: Session, detalle_venta_fixture, 
                                         inventario_fixture, usuario_fixture):
        """Test actualizar cantidad de detalle"""
        nueva_cantidad = detalle_venta_fixture.cantidad + 2
        detalle_data = DetalleVentaUpdate(cantidad=nueva_cantidad)
        
        result = update_detalle_venta(session, detalle_venta_fixture.id, detalle_data, usuario_fixture)
        
        # Verificar que el detalle fue actualizado
        detalle_updated = next(d for d in result.detalle_ventas if d.id == detalle_venta_fixture.id)
        assert detalle_updated.cantidad == nueva_cantidad

        # Verificar que se creó el movimiento
        movimiento = session.exec(
            select(MovimientoInventario)
            .where(MovimientoInventario.producto_id == inventario_fixture.producto_id)
            .where(MovimientoInventario.tipo == TipoMovimientoEnum.VENTA)
        ).first()
        
        assert movimiento is not None
        assert movimiento.cantidad == 2  # Cantidad nueva del detalle venta
        assert movimiento.cantidad_inventario == inventario_fixture.cantidad

    def test_update_detalle_venta_precio(self, session: Session, detalle_venta_fixture, usuario_fixture, inventario_fixture):
        """Test actualizar precio de detalle"""
        nuevo_precio = Decimal("25.00")
        detalle_data = DetalleVentaUpdate(precio_unitario=nuevo_precio)
        
        result = update_detalle_venta(session, detalle_venta_fixture.id, detalle_data, usuario_fixture)
        
        detalle_updated = next(d for d in result.detalle_ventas if d.id == detalle_venta_fixture.id)
        assert detalle_updated.precio_unitario == nuevo_precio

    def test_update_detalle_venta_not_found(self, session: Session, usuario_fixture):
        """Test actualizar detalle inexistente"""
        detalle_data = DetalleVentaUpdate(cantidad=5)
        
        with pytest.raises(HTTPException) as exc_info:
            update_detalle_venta(session, 99999, detalle_data, usuario_fixture)
        
        assert exc_info.value.status_code == 404


class TestDeleteDetalleVenta:
    """Pruebas para eliminar detalles de venta"""
    
    def test_delete_detalle_venta_success(self, session: Session, detalle_venta_fixture, 
                                        inventario_fixture, usuario_fixture):
        """Test eliminar detalle de venta"""
        cantidad_original = detalle_venta_fixture.cantidad
        inventario_original = inventario_fixture.cantidad
        
        result = delete_detalle_venta(session, detalle_venta_fixture.id, usuario_fixture)
        
        # Verificar que el detalle fue eliminado
        assert not any(d.id == detalle_venta_fixture.id for d in result.detalle_ventas)
        
        # Verificar que el stock fue devuelto
        inventario_updated = session.get(Inventario, inventario_fixture.id)
        assert inventario_updated.cantidad == inventario_original + cantidad_original


        # Verificar que se creó el movimiento
        movimiento = session.exec(
            select(MovimientoInventario)
            .where(MovimientoInventario.producto_id == inventario_fixture.producto_id)
            .where(MovimientoInventario.tipo == TipoMovimientoEnum.ANULACIÓN_VENTA)
        ).first()
        
        assert movimiento is not None
        assert movimiento.cantidad == 5  # Cantidad de detalle venta
        assert movimiento.cantidad_inventario == inventario_fixture.cantidad

    def test_delete_detalle_venta_not_found(self, session: Session, usuario_fixture):
        """Test eliminar detalle inexistente"""
        with pytest.raises(HTTPException) as exc_info:
            delete_detalle_venta(session, 99999, usuario_fixture)
        
        assert exc_info.value.status_code == 404


class TestGetDetallesVentaByVentaId:
    """Pruebas para obtener detalles por ID de venta"""
    
    def test_get_detalles_venta_by_venta_id_success(self, session: Session, detalle_venta_fixture):
        """Test obtener detalles de una venta"""
        result = get_detalles_venta_by_venta_id(
            detalle_venta_fixture.venta_id, session
        )
        
        assert result.total >= 1
        assert any(d.id == detalle_venta_fixture.id for d in result.items)

    def test_get_detalles_venta_by_venta_id_not_found(self, session: Session):
        """Test obtener detalles de venta inexistente"""
        with pytest.raises(HTTPException) as exc_info:
            get_detalles_venta_by_venta_id(99999, session)
        
        assert exc_info.value.status_code == 404

    def test_get_detalles_venta_with_search(self, session: Session, detalle_venta_fixture):
        """Test buscar detalles por nombre de producto"""
        producto_nombre = detalle_venta_fixture.producto.nombre
        
        result = get_detalles_venta_by_venta_id(
            detalle_venta_fixture.venta_id, session, search=producto_nombre
        )
        
        assert result.total >= 1
        assert any(d.id == detalle_venta_fixture.id for d in result.items)


class TestGetDetalleVentaById:
    """Pruebas para obtener detalle por ID"""
    
    def test_get_detalle_venta_by_id_success(self, session: Session, detalle_venta_fixture):
        """Test obtener detalle por ID"""
        result = get_detalle_venta_by_id(session, detalle_venta_fixture.id)
        
        assert result.id == detalle_venta_fixture.id
        assert result.cantidad == detalle_venta_fixture.cantidad
        assert result.producto is not None

    def test_get_detalle_venta_by_id_not_found(self, session: Session):
        """Test obtener detalle inexistente"""
        with pytest.raises(HTTPException) as exc_info:
            get_detalle_venta_by_id(session, 99999)
        
        assert exc_info.value.status_code == 404

