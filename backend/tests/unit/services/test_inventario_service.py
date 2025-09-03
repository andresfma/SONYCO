import pytest
from sqlmodel import Session, select
from fastapi import HTTPException
from unittest.mock import patch

from app.models.inventario import Inventario
from app.models.producto import Producto, UnidadMedida
from app.models.movimiento_inventario import MovimientoInventario, TipoMovimientoEnum

from app.schemas.inventario import (
    InventarioCantidadCreate, 
    InventarioCantidadUpdate
)
from app.schemas.movimiento_inventario import MovimientoInventarioCreate
from app.services.inventario_service import (
    get_inventarios,
    get_inventario_by_product_id,
    register_inventario,
    register_entrada,
    register_salida,
    get_historial_movimientos_by_producto,
    get_historial_movimientos_by_usuario,
    get_movimientos_inventario,
    get_inventarios_stock_bajo,
    update_inventario,
    change_estado_inventario,
    get_inventario_by_id,
    get_movimiento_by_id
)


class TestGetInventarios:
    """Tests para la función get_inventarios."""
    
    def test_get_inventarios_sin_filtros(self, session: Session, inventario_fixture):
        """Debe devolver todos los inventarios sin filtros aplicados."""
        result = get_inventarios(session)
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.current_page == 1
        assert result.total_pages == 1
        assert result.items[0].id == inventario_fixture.id
        assert result.items[0].cantidad == 100
    
    def test_get_inventarios_busqueda_por_producto_nombre(self, session: Session, inventario_fixture):
        """Debe filtrar inventarios por nombre del producto."""
        result = get_inventarios(session, search="Martillo")
        
        assert result.total == 1
        assert result.items[0].producto.nombre == "Martillo"
    
    def test_get_inventarios_busqueda_por_producto_codigo(self, session: Session, inventario_fixture):
        """Debe filtrar inventarios por código del producto."""
        result = get_inventarios(session, search="P001")
        
        assert result.total == 1
        assert result.items[0].producto.codigo == "P001"
    
    def test_get_inventarios_filtro_por_estado(self, session: Session, categoria_fixture, producto_fixture, inventario_fixture):
        """Debe filtrar inventarios por estado."""
        # Crear inventario inactivo
        producto_inactivo = Producto(
            codigo="P002", nombre="Producto Inactivo", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        session.add(producto_inactivo)
        session.commit()
        
        inventario_inactivo = Inventario(
            producto_id=producto_inactivo.id, cantidad=50, estado=False
        )
        session.add(inventario_inactivo)
        session.commit()
        
        result = get_inventarios(session, estado=True)
        
        assert result.total == 1
        assert all(item.estado == True for item in result.items)
    
    def test_get_inventarios_ordenamiento_por_cantidad(self, session: Session, categoria_fixture):
        """Debe ordenar inventarios por cantidad."""
        # Crear productos y inventarios adicionales
        producto2 = Producto(
            codigo="P002", nombre="Destornillador", precio_unitario=5.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        session.add(producto2)
        session.commit()
        
        inventario2 = Inventario(producto_id=producto2.id, cantidad=50)
        session.add(inventario2)
        session.commit()
        
        result = get_inventarios(session, sort_by="cantidad", sort_order="asc")
        
        cantidades = [item.cantidad for item in result.items]
        assert cantidades == sorted(cantidades)
    
    def test_get_inventarios_paginacion(self, session: Session, categoria_fixture, inventario_fixture):
        """Debe paginar correctamente."""
        # Crear inventarios adicionales
        for i in range(2, 5):
            producto = Producto(
                codigo=f"P00{i}", nombre=f"Producto {i}", precio_unitario=10.0,
                unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
            )
            session.add(producto)
            session.commit()
            
            inventario = Inventario(producto_id=producto.id, cantidad=i * 10)
            session.add(inventario)
        session.commit()
        
        result = get_inventarios(session, page=1, page_size=2)
        
        assert result.total == 4
        assert len(result.items) == 2
        assert result.current_page == 1
        assert result.total_pages == 2


class TestGetInventarioByProductId:
    """Tests para la función get_inventario_by_product_id."""
    
    def test_get_inventario_by_product_id_existente(self, session: Session, inventario_fixture, producto_fixture):
        """Debe devolver el inventario cuando existe."""
        result = get_inventario_by_product_id(session, producto_fixture.id)
        
        assert result is not None
        assert result.producto_id == producto_fixture.id
        assert result.cantidad == 100
        assert result.producto is not None
    
    def test_get_inventario_by_product_id_no_existente(self, session: Session):
        """Debe devolver None cuando el producto no tiene inventario."""
        result = get_inventario_by_product_id(session, 99999)
        
        assert result is None


class TestRegisterInventario:
    """Tests para la función register_inventario."""
    
    def test_register_inventario_exitoso(self, session: Session, categoria_fixture):
        """Debe crear un inventario correctamente."""
        producto = Producto(
            codigo="P999", nombre="Nuevo Producto", precio_unitario=25.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        session.add(producto)
        session.commit()
        
        data = InventarioCantidadCreate(
            producto_id=producto.id,
            cantidad=50,
            cantidad_minima=5
        )
        
        result = register_inventario(session, data)
        
        assert result.producto_id == producto.id
        assert result.cantidad == 50
        assert result.cantidad_minima == 5
        assert result.estado == True
        
        # Verificar que se guardó en la base de datos
        inventario_db = session.get(Inventario, result.id)
        assert inventario_db is not None
    
    def test_register_inventario_producto_ya_existe_en_inventario(self, session: Session, inventario_fixture):
        """Debe lanzar excepción cuando el producto ya está en inventario."""
        data = InventarioCantidadCreate(
            producto_id=inventario_fixture.producto_id,
            cantidad=25
        )
        
        with pytest.raises(HTTPException) as exc_info:
            register_inventario(session, data)
        
        assert exc_info.value.status_code == 400
        assert "ya se encuentra en el inventario" in exc_info.value.detail
    
    def test_register_inventario_producto_no_existente(self, session: Session):
        """Debe lanzar excepción cuando el producto no existe."""
        data = InventarioCantidadCreate(
            producto_id=99999,
            cantidad=25
        )
        
        with pytest.raises(HTTPException) as exc_info:
            register_inventario(session, data)
        
        assert exc_info.value.status_code == 404
        assert "no encontrado" in exc_info.value.detail
    
    def test_register_inventario_producto_inactivo(self, session: Session, categoria_fixture):
        """Debe lanzar excepción cuando el producto está inactivo."""
        producto_inactivo = Producto(
            codigo="P998", nombre="Producto Inactivo", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id,
            estado=False
        )
        session.add(producto_inactivo)
        session.commit()
        
        data = InventarioCantidadCreate(
            producto_id=producto_inactivo.id,
            cantidad=25
        )
        
        with pytest.raises(HTTPException) as exc_info:
            register_inventario(session, data)
        
        assert exc_info.value.status_code == 400
        assert "inactivo" in exc_info.value.detail


class TestRegisterEntrada:
    """Tests para la función register_entrada."""
    
    def test_register_entrada_exitosa(self, session: Session, inventario_fixture, usuario_fixture):
        """Debe registrar una entrada correctamente."""
        cantidad_inicial = inventario_fixture.cantidad
        data = MovimientoInventarioCreate(
            producto_id=inventario_fixture.producto_id,
            cantidad=25
        )
        
        result = register_entrada(session, data, usuario_fixture)
        
        assert result.tipo == TipoMovimientoEnum.ENTRADA
        assert result.cantidad == 25
        assert result.producto_id == inventario_fixture.producto_id
        assert result.usuario_id == usuario_fixture.id
        
        # Verificar que se actualizó el inventario
        session.refresh(inventario_fixture)
        assert inventario_fixture.cantidad == cantidad_inicial + 25
        assert result.cantidad_inventario == inventario_fixture.cantidad
    
    def test_register_entrada_producto_no_en_inventario(self, session: Session, usuario_fixture):
        """Debe lanzar excepción cuando el producto no está en inventario."""
        data = MovimientoInventarioCreate(
            producto_id=99999,
            cantidad=25
        )
        
        with pytest.raises(HTTPException) as exc_info:
            register_entrada(session, data, usuario_fixture)
        
        assert exc_info.value.status_code == 404
        assert "no encontrado en inventario" in exc_info.value.detail
    
    def test_register_entrada_inventario_inactivo(self, session: Session, categoria_fixture, usuario_fixture):
        """Debe lanzar excepción cuando el inventario está inactivo."""
        producto = Producto(
            codigo="P998", nombre="Producto Test", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        session.add(producto)
        session.commit()
        
        inventario = Inventario(
            producto_id=producto.id, cantidad=50, estado=False
        )
        session.add(inventario)
        session.commit()
        
        data = MovimientoInventarioCreate(
            producto_id=producto.id,
            cantidad=25
        )
        
        with pytest.raises(HTTPException) as exc_info:
            register_entrada(session, data, usuario_fixture)
        
        assert exc_info.value.status_code == 400
        assert "inactivo" in exc_info.value.detail


class TestRegisterSalida:
    """Tests para la función register_salida."""
    
    def test_register_salida_exitosa(self, session: Session, inventario_fixture, usuario_fixture):
        """Debe registrar una salida correctamente."""
        cantidad_inicial = inventario_fixture.cantidad
        data = MovimientoInventarioCreate(
            producto_id=inventario_fixture.producto_id,
            cantidad=25
        )
        
        result = register_salida(session, data, usuario_fixture)
        
        assert result.tipo == TipoMovimientoEnum.SALIDA
        assert result.cantidad == 25
        assert result.producto_id == inventario_fixture.producto_id
        assert result.usuario_id == usuario_fixture.id
        
        # Verificar que se actualizó el inventario
        session.refresh(inventario_fixture)
        assert inventario_fixture.cantidad == cantidad_inicial - 25
        assert result.cantidad_inventario == inventario_fixture.cantidad
    
    def test_register_salida_stock_insuficiente(self, session: Session, inventario_fixture, usuario_fixture):
        """Debe lanzar excepción cuando no hay stock suficiente."""
        data = MovimientoInventarioCreate(
            producto_id=inventario_fixture.producto_id,
            cantidad=150  # Mayor que la cantidad disponible (100)
        )
        
        with pytest.raises(HTTPException) as exc_info:
            register_salida(session, data, usuario_fixture)
        
        assert exc_info.value.status_code == 400
        assert "Stock insuficiente" in exc_info.value.detail
    
    def test_register_salida_producto_no_en_inventario(self, session: Session, usuario_fixture):
        """Debe lanzar excepción cuando el producto no está en inventario."""
        data = MovimientoInventarioCreate(
            producto_id=99999,
            cantidad=25
        )
        
        with pytest.raises(HTTPException) as exc_info:
            register_salida(session, data, usuario_fixture)
        
        assert exc_info.value.status_code == 404
        assert "no encontrado en inventario" in exc_info.value.detail


class TestGetHistorialMovimientosByProducto:
    """Tests para la función get_historial_movimientos_by_producto."""
    
    def test_get_historial_movimientos_by_producto_basic(self, session: Session, movimiento_fixture):
        """Debe devolver movimientos del producto."""
        result = get_historial_movimientos_by_producto(
            session, movimiento_fixture.producto_id
        )
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].id == movimiento_fixture.id
        assert result.items[0].tipo == TipoMovimientoEnum.ENTRADA
    
    def test_get_historial_movimientos_filtro_por_tipo(self, session: Session, producto_fixture, usuario_fixture):
        """Debe filtrar movimientos por tipo."""
        # Crear movimientos de diferentes tipos
        movimientos = [
            MovimientoInventario(
                producto_id=producto_fixture.id,
                tipo=TipoMovimientoEnum.ENTRADA,
                cantidad=10,
                cantidad_inventario=10,
                usuario_id=usuario_fixture.id
            ),
            MovimientoInventario(
                producto_id=producto_fixture.id,
                tipo=TipoMovimientoEnum.SALIDA,
                cantidad=5,
                cantidad_inventario=5,
                usuario_id=usuario_fixture.id
            )
        ]
        session.add_all(movimientos)
        session.commit()
        
        result = get_historial_movimientos_by_producto(
            session, producto_fixture.id, tipo=TipoMovimientoEnum.ENTRADA
        )
        
        assert result.total == 1
        assert all(item.tipo == TipoMovimientoEnum.ENTRADA for item in result.items)
    
    def test_get_historial_movimientos_paginacion(self, session: Session, producto_fixture, usuario_fixture):
        """Debe paginar correctamente."""
        # Crear múltiples movimientos
        movimientos = [
            MovimientoInventario(
                producto_id=producto_fixture.id,
                tipo=TipoMovimientoEnum.ENTRADA,
                cantidad=i,
                cantidad_inventario=i,
                usuario_id=usuario_fixture.id
            )
            for i in range(1, 6)  # 5 movimientos
        ]
        session.add_all(movimientos)
        session.commit()
        
        result = get_historial_movimientos_by_producto(
            session, producto_fixture.id, page=1, page_size=2
        )
        
        assert result.total == 5
        assert len(result.items) == 2
        assert result.current_page == 1
        assert result.total_pages == 3


class TestGetHistorialMovimientosByUsuario:
    """Tests para la función get_historial_movimientos_by_usuario."""
    
    def test_get_historial_movimientos_by_usuario_basic(self, session: Session, movimiento_fixture):
        """Debe devolver movimientos del usuario."""
        result = get_historial_movimientos_by_usuario(
            session, movimiento_fixture.usuario_id
        )
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].usuario.id == movimiento_fixture.usuario_id
    
    def test_get_historial_movimientos_by_usuario_filtro_tipo(self, session: Session, producto_fixture, usuario_fixture):
        """Debe filtrar movimientos del usuario por tipo."""
        # Crear movimientos de diferentes tipos
        movimientos = [
            MovimientoInventario(
                producto_id=producto_fixture.id,
                tipo=TipoMovimientoEnum.ENTRADA,
                cantidad=10,
                usuario_id=usuario_fixture.id
            ),
            MovimientoInventario(
                producto_id=producto_fixture.id,
                tipo=TipoMovimientoEnum.SALIDA,
                cantidad=5,
                usuario_id=usuario_fixture.id
            )
        ]
        session.add_all(movimientos)
        session.commit()
        
        result = get_historial_movimientos_by_usuario(
            session, usuario_fixture.id, tipo=TipoMovimientoEnum.SALIDA
        )
        
        assert result.total == 1
        assert all(item.tipo == TipoMovimientoEnum.SALIDA for item in result.items)


class TestGetMovimientosInventario:
    """Tests para la función get_movimientos_inventario."""
    
    def test_get_movimientos_inventario_sin_filtros(self, session: Session, movimiento_fixture):
        """Debe devolver todos los movimientos sin filtros."""
        result = get_movimientos_inventario(session)
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].id == movimiento_fixture.id
    
    def test_get_movimientos_inventario_filtro_tipo(self, session: Session, producto_fixture, usuario_fixture):
        """Debe filtrar movimientos por tipo."""
        # Crear movimientos de diferentes tipos
        movimientos = [
            MovimientoInventario(
                producto_id=producto_fixture.id,
                tipo=TipoMovimientoEnum.ENTRADA,
                cantidad=10,
                usuario_id=usuario_fixture.id
            ),
            MovimientoInventario(
                producto_id=producto_fixture.id,
                tipo=TipoMovimientoEnum.SALIDA,
                cantidad=5,
                usuario_id=usuario_fixture.id
            )
        ]
        session.add_all(movimientos)
        session.commit()
        
        result = get_movimientos_inventario(session, tipo=TipoMovimientoEnum.ENTRADA)
        
        assert result.total == 1
        assert all(item.tipo == TipoMovimientoEnum.ENTRADA for item in result.items)
    
    def test_get_movimientos_inventario_busqueda_usuario(self, session: Session, movimiento_fixture):
        """Debe buscar movimientos por nombre de usuario."""
        result = get_movimientos_inventario(session, search=movimiento_fixture.usuario.nombre)
        
        assert result.total == 1
        assert result.items[0].usuario.nombre == movimiento_fixture.usuario.nombre
    
    def test_get_movimientos_inventario_busqueda_producto(self, session: Session, movimiento_fixture):
        """Debe buscar movimientos por nombre o código de producto."""
        result = get_movimientos_inventario(session, search="Martillo")
        
        assert result.total == 1
        assert "Martillo" in result.items[0].producto.nombre
    
    def test_get_movimientos_inventario_ordenamiento(self, session: Session, producto_fixture, usuario_fixture):
        """Debe ordenar movimientos correctamente."""
        # Crear movimientos con diferentes cantidades
        movimientos = [
            MovimientoInventario(
                producto_id=producto_fixture.id,
                tipo=TipoMovimientoEnum.ENTRADA,
                cantidad=5,
                usuario_id=usuario_fixture.id
            ),
            MovimientoInventario(
                producto_id=producto_fixture.id,
                tipo=TipoMovimientoEnum.ENTRADA,
                cantidad=15,
                usuario_id=usuario_fixture.id
            )
        ]
        session.add_all(movimientos)
        session.commit()
        
        result = get_movimientos_inventario(
            session, sort_by="cantidad", sort_order="asc"
        )
        
        cantidades = [item.cantidad for item in result.items]
        assert cantidades == sorted(cantidades)


class TestGetInventariosStockBajo:
    """Tests para la función get_inventarios_stock_bajo."""
    
    @patch('app.core.config.settings.STOCK_MINIMO', 20)
    def test_get_inventarios_stock_bajo_basic(self, session: Session, categoria_fixture):
        """Debe devolver inventarios con stock bajo."""
        # Crear producto con stock bajo
        producto = Producto(
            codigo="P999", nombre="Stock Bajo", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        session.add(producto)
        session.commit()
        
        inventario_stock_bajo = Inventario(
            producto_id=producto.id, cantidad=10, cantidad_minima=20
        )
        session.add(inventario_stock_bajo)
        session.commit()
        
        result = get_inventarios_stock_bajo(session)
        
        assert result.total == 1
        assert result.items[0].cantidad < result.items[0].cantidad_minima
    
    def test_get_inventarios_stock_bajo_busqueda(self, session: Session, categoria_fixture):
        """Debe filtrar inventarios de stock bajo por búsqueda."""
        # Crear producto con stock bajo
        producto = Producto(
            codigo="P888", nombre="Búsqueda Stock", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        session.add(producto)
        session.commit()
        
        inventario = Inventario(
            producto_id=producto.id, cantidad=5, cantidad_minima=20
        )
        session.add(inventario)
        session.commit()
        
        result = get_inventarios_stock_bajo(session, search="Búsqueda")
        
        assert result.total == 1
        assert "Búsqueda" in result.items[0].producto.nombre


class TestUpdateInventario:
    """Tests para la función update_inventario."""
    
    def test_update_inventario_cantidad_exitoso(self, session: Session, inventario_fixture, usuario_fixture):
        """Debe actualizar la cantidad y crear movimiento."""
        nueva_cantidad = 150
        data = InventarioCantidadUpdate(cantidad=nueva_cantidad)
        
        result = update_inventario(session, inventario_fixture.id, data, usuario_fixture)
        
        assert result.cantidad == nueva_cantidad
        
        # Verificar que se creó el movimiento
        movimiento = session.exec(
            select(MovimientoInventario)
            .where(MovimientoInventario.producto_id == inventario_fixture.producto_id)
            .where(MovimientoInventario.tipo == TipoMovimientoEnum.ENTRADA_EDICIÓN)
        ).first()
        
        assert movimiento is not None
        assert movimiento.cantidad == 50  # Diferencia: 150 - 100
        assert movimiento.cantidad_inventario == nueva_cantidad
    
    def test_update_inventario_reducir_cantidad(self, session: Session, inventario_fixture, usuario_fixture):
        """Debe crear movimiento de salida al reducir cantidad."""
        nueva_cantidad = 75
        data = InventarioCantidadUpdate(cantidad=nueva_cantidad)
        
        result = update_inventario(session, inventario_fixture.id, data, usuario_fixture)
        
        assert result.cantidad == nueva_cantidad
        
        # Verificar movimiento de salida
        movimiento = session.exec(
            select(MovimientoInventario)
            .where(MovimientoInventario.tipo == TipoMovimientoEnum.SALIDA_EDICIÓN)
        ).first()
        
        assert movimiento is not None
        assert movimiento.cantidad == 25  # Diferencia: 100 - 75
    
    def test_update_inventario_cantidad_minima(self, session: Session, inventario_fixture, usuario_fixture):
        """Debe actualizar la cantidad mínima."""
        data = InventarioCantidadUpdate(cantidad_minima=20)
        
        result = update_inventario(session, inventario_fixture.id, data, usuario_fixture)
        
        assert result.cantidad_minima == 20
    
    def test_update_inventario_cantidad_negativa(self, session: Session, inventario_fixture, usuario_fixture):
        """Debe lanzar excepción con cantidad negativa."""
        data = InventarioCantidadUpdate(cantidad=-10)
        
        with pytest.raises(HTTPException) as exc_info:
            update_inventario(session, inventario_fixture.id, data, usuario_fixture)
        
        assert exc_info.value.status_code == 400
        assert "no puede ser negativa" in exc_info.value.detail
    
    def test_update_inventario_no_existente(self, session: Session, usuario_fixture):
        """Debe lanzar excepción cuando el inventario no existe."""
        data = InventarioCantidadUpdate(cantidad=50)
        
        with pytest.raises(HTTPException) as exc_info:
            update_inventario(session, 99999, data, usuario_fixture)
        
        assert exc_info.value.status_code == 404
        assert "no encontrado" in exc_info.value.detail


class TestChangeEstadoInventario:
    """Tests para la función change_estado_inventario."""
    
    def test_change_estado_inventario_desactivar(self, session: Session, inventario_fixture):
        """Debe cambiar el estado del inventario a inactivo."""
        result = change_estado_inventario(session, inventario_fixture.id)
        
        assert result.estado == False
        
        # Verificar que se sincronizó el producto
        session.refresh(inventario_fixture)
        producto = session.get(Producto, inventario_fixture.producto_id)
        assert producto.estado == False
    
    def test_change_estado_inventario_activar(self, session: Session, categoria_fixture):
        """Debe cambiar el estado del inventario a activo."""
        producto = Producto(
            codigo="P997", nombre="Para Activar", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id,
            estado=False
        )
        session.add(producto)
        session.commit()
        
        inventario = Inventario(
            producto_id=producto.id, cantidad=50, estado=False
        )
        session.add(inventario)
        session.commit()
        
        result = change_estado_inventario(session, inventario.id)
        
        assert result.estado == True
        session.refresh(producto)
        assert producto.estado == True
    
    def test_change_estado_inventario_no_existente(self, session: Session):
        """Debe lanzar excepción cuando el inventario no existe."""
        with pytest.raises(HTTPException) as exc_info:
            change_estado_inventario(session, 99999)
        
        assert exc_info.value.status_code == 404
        assert "no encontrado" in exc_info.value.detail


class TestGetInventarioById:
    """Tests para la función get_inventario_by_id."""
    
    def test_get_inventario_by_id_existente(self, session: Session, inventario_fixture):
        """Debe devolver el inventario cuando existe."""
        result = get_inventario_by_id(session, inventario_fixture.id)
        
        assert result is not None
        assert result.id == inventario_fixture.id
        assert result.producto is not None
    
    def test_get_inventario_by_id_no_existente(self, session: Session):
        """Debe devolver None cuando el inventario no existe."""
        result = get_inventario_by_id(session, 99999)
        
        assert result is None


class TestGetMovimientoById:
    """Tests para la función get_movimiento_by_id."""
    
    def test_get_movimiento_by_id_existente(self, session: Session, movimiento_fixture):
        """Debe devolver el movimiento cuando existe."""
        result = get_movimiento_by_id(session, movimiento_fixture.id)
        
        assert result is not None
        assert result.id == movimiento_fixture.id
        assert result.producto is not None
        assert result.usuario is not None
    
    def test_get_movimiento_by_id_no_existente(self, session: Session):
        """Debe devolver None cuando el movimiento no existe."""
        result = get_movimiento_by_id(session, 99999)
        
        assert result is None