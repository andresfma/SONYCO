import pytest
from sqlmodel import Session, select, func
from fastapi import HTTPException
from unittest.mock import Mock
from typing import Optional

from app.models.producto import Producto, UnidadMedida
from app.models.categoria import Categoria
from app.schemas.producto import ProductoCreate, ProductoUpdate
from app.services.producto_service import (
    get_productos,
    get_numero_total_productos,
    get_producto_by_code,
    get_producto_by_id,
    create_producto,
    update_producto,
    delete_producto,
    change_estado_producto,
    get_productos_infinito_inventario,
    get_productos_infinito_movimiento
)


class TestGetProductos:
    """Tests para la función get_productos con filtros, paginación y ordenamiento."""
    
    def test_get_productos_sin_filtros(self, session: Session, producto_fixture):
        """Debe devolver todos los productos sin filtros aplicados."""
        result = get_productos(session)
        
        assert result.total == 1
        assert len(result.items) == 1
        assert result.current_page == 1
        assert result.total_pages == 1
        assert result.items[0].codigo == "P001"
        assert result.items[0].nombre == "Martillo"
    
    def test_get_productos_con_multiples_productos(self, session: Session, categoria_fixture):
        """Debe paginar correctamente con múltiples productos."""
        # Crear productos adicionales
        productos = [
            Producto(codigo=f"P00{i}", nombre=f"Producto {i}", precio_unitario=10.0,
                    unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id)
            for i in range(2, 6)  # P002, P003, P004, P005
        ]
        session.add_all(productos)
        session.commit()
        
        result = get_productos(session, page=1, page_size=2)
        
        assert result.total == 4
        assert len(result.items) == 2
        assert result.current_page == 1
        assert result.total_pages == 2
    
    def test_get_productos_busqueda_por_nombre(self, session: Session, categoria_fixture):
        """Debe filtrar productos por nombre."""
        # Agregar producto adicional
        producto2 = Producto(
            codigo="P002", nombre="Destornillador", precio_unitario=5.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        session.add(producto2)
        session.commit()
        
        result = get_productos(session, search="Destorn")
        
        assert result.total == 1
        assert result.items[0].nombre == "Destornillador"
    
    def test_get_productos_busqueda_por_codigo(self, session: Session, producto_fixture):
        """Debe filtrar productos por código."""
        result = get_productos(session, search="P001")
        
        assert result.total == 1
        assert result.items[0].codigo == "P001"
    
    def test_get_productos_filtro_por_categoria(self, session: Session, categoria_fixture, producto_fixture):
        """Debe filtrar productos por nombre de categoría."""
        result = get_productos(session, categoria=categoria_fixture.nombre)
        
        assert result.total == 1
        assert result.items[0].categoria.nombre == categoria_fixture.nombre
    
    def test_get_productos_filtro_por_estado_activo(self, session: Session, categoria_fixture, producto_fixture):
        """Debe filtrar productos por estado activo."""
        # Crear producto inactivo
        producto_inactivo = Producto(
            codigo="P002", nombre="Producto Inactivo", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id,
            estado=False
        )
        session.add(producto_inactivo)
        session.commit()
        
        result = get_productos(session, estado=True)
        
        assert result.total == 1
        assert all(item.estado == True for item in result.items)
    
    def test_get_productos_ordenamiento_asc(self, session: Session, categoria_fixture):
        """Debe ordenar productos ascendentemente."""
        # Agregar productos para ordenar
        productos = [
            Producto(codigo="P002", nombre="Zebra", precio_unitario=10.0,
                    unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id),
            Producto(codigo="P003", nombre="Alpha", precio_unitario=15.0,
                    unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id)
        ]
        session.add_all(productos)
        session.commit()
        
        result = get_productos(session, sort_by="nombre", sort_order="asc")
        
        nombres = [item.nombre for item in result.items]
        assert nombres == sorted(nombres)
    
    def test_get_productos_ordenamiento_desc(self, session: Session, categoria_fixture):
        """Debe ordenar productos descendentemente."""
        # Agregar productos para ordenar
        productos = [
            Producto(codigo="P002", nombre="Alpha", precio_unitario=10.0,
                    unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id),
            Producto(codigo="P003", nombre="Zebra", precio_unitario=15.0,
                    unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id)
        ]
        session.add_all(productos)
        session.commit()
        
        result = get_productos(session, sort_by="precio_unitario", sort_order="desc")
        
        precios = [item.precio_unitario for item in result.items]
        assert precios == sorted(precios, reverse=True)
    
    def test_get_productos_paginacion_segunda_pagina(self, session: Session, categoria_fixture, producto_fixture):
        """Debe devolver la segunda página correctamente."""
        # Crear productos adicionales
        productos = [
            Producto(codigo=f"P00{i}", nombre=f"Producto {i}", precio_unitario=10.0,
                    unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id)
            for i in range(2, 5)  # P002, P003, P004
        ]
        session.add_all(productos)
        session.commit()
        
        result = get_productos(session, page=2, page_size=2)
        
        assert result.total == 4
        assert len(result.items) == 2
        assert result.current_page == 2
        assert result.total_pages == 2


class TestGetNumeroTotalProductos:
    """Tests para la función get_numero_total_productos."""
    
    def test_get_numero_total_productos_con_productos(self, session: Session, producto_fixture):
        """Debe devolver el número correcto de productos."""
        result = get_numero_total_productos(session)
        
        assert result.total == 1
    
    def test_get_numero_total_productos_sin_productos(self, session: Session):
        """Debe devolver 0 cuando no hay productos."""
        result = get_numero_total_productos(session)
        
        assert result.total == 0


class TestGetProductoByCode:
    """Tests para la función get_producto_by_code."""
    
    def test_get_producto_by_code_existente(self, session: Session, producto_fixture):
        """Debe devolver el producto cuando existe."""
        result = get_producto_by_code(session, "P001")
        
        assert result is not None
        assert result.codigo == "P001"
        assert result.nombre == "Martillo"
        assert result.categoria is not None
    
    def test_get_producto_by_code_no_existente(self, session: Session):
        """Debe devolver None cuando el código no existe."""
        result = get_producto_by_code(session, "NOEXISTE")
        
        assert result is None


class TestGetProductoById:
    """Tests para la función get_producto_by_id."""
    
    def test_get_producto_by_id_existente(self, session: Session, producto_fixture):
        """Debe devolver el producto cuando existe."""
        result = get_producto_by_id(session, producto_fixture.id)
        
        assert result is not None
        assert result.id == producto_fixture.id
        assert result.codigo == "P001"
        assert result.categoria is not None
    
    def test_get_producto_by_id_no_existente(self, session: Session):
        """Debe devolver None cuando el ID no existe."""
        result = get_producto_by_id(session, 99999)
        
        assert result is None


class TestCreateProducto:
    """Tests para la función create_producto."""
    
    def test_create_producto_exitoso(self, session: Session, categoria_fixture):
        """Debe crear un producto correctamente."""
        producto_data = ProductoCreate(
            codigo="P999",
            nombre="Nuevo Producto",
            descripcion="Producto de prueba",
            precio_unitario=25.0,
            unidad_medida=UnidadMedida.KILOGRAMO,
            categoria_id=categoria_fixture.id
        )
        
        result = create_producto(session, producto_data)
        
        assert result.id is not None
        assert result.codigo == "P999"
        assert result.nombre == "Nuevo Producto"
        assert result.categoria.id == categoria_fixture.id
        
        # Verificar que se guardó en la base de datos
        producto_db = session.get(Producto, result.id)
        assert producto_db is not None
        assert producto_db.codigo == "P999"
    
    def test_create_producto_codigo_duplicado(self, session: Session, producto_fixture):
        """Debe lanzar excepción cuando el código ya existe."""
        producto_data = ProductoCreate(
            codigo="P001",  # Código que ya existe
            nombre="Otro Producto",
            precio_unitario=15.0,
            unidad_medida=UnidadMedida.UNIDAD,
            categoria_id=producto_fixture.categoria_id
        )
        
        with pytest.raises(HTTPException) as exc_info:
            create_producto(session, producto_data)
        
        assert exc_info.value.status_code == 400
        assert "ya existe" in exc_info.value.detail


class TestUpdateProducto:
    """Tests para la función update_producto."""
    
    def test_update_producto_exitoso(self, session: Session, producto_fixture):
        """Debe actualizar un producto correctamente."""
        update_data = ProductoUpdate(
            nombre="Martillo Actualizado",
            precio_unitario=15.0
        )
        
        result = update_producto(session, producto_fixture.id, update_data)
        
        assert result is not None
        assert result.nombre == "Martillo Actualizado"
        assert result.precio_unitario == 15.0
        assert result.codigo == "P001"  # No debe cambiar
    
    def test_update_producto_codigo_duplicado(self, session: Session, categoria_fixture):
        """Debe lanzar excepción cuando se intenta actualizar con código duplicado."""
        # Crear dos productos
        producto1 = Producto(
            codigo="P001", nombre="Producto 1", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        producto2 = Producto(
            codigo="P002", nombre="Producto 2", precio_unitario=20.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        session.add_all([producto1, producto2])
        session.commit()
        
        # Intentar actualizar producto2 con el código de producto1
        update_data = ProductoUpdate(codigo="P001")
        
        with pytest.raises(HTTPException) as exc_info:
            update_producto(session, producto2.id, update_data)
        
        assert exc_info.value.status_code == 400
        assert "ya existe" in exc_info.value.detail
    
    def test_update_producto_no_existente(self, session: Session):
        """Debe devolver None cuando el producto no existe."""
        update_data = ProductoUpdate(nombre="Producto Inexistente")
        
        result = update_producto(session, 99999, update_data)
        
        assert result is None
    
    def test_update_producto_mismo_codigo(self, session: Session, producto_fixture):
        """Debe permitir actualizar con el mismo código actual."""
        update_data = ProductoUpdate(
            codigo="P001",  # Mismo código actual
            nombre="Martillo Actualizado"
        )
        
        result = update_producto(session, producto_fixture.id, update_data)
        
        assert result is not None
        assert result.codigo == "P001"
        assert result.nombre == "Martillo Actualizado"


class TestDeleteProducto:
    """Tests para la función delete_producto."""
    
    def test_delete_producto_exitoso(self, session: Session, producto_fixture):
        """Debe eliminar un producto correctamente."""
        producto_id = producto_fixture.id
        
        result = delete_producto(session, producto_id)
        
        assert result == True
        
        # Verificar que se eliminó de la base de datos
        producto_db = session.get(Producto, producto_id)
        assert producto_db is None
    
    def test_delete_producto_no_existente(self, session: Session):
        """Debe lanzar excepción cuando el producto no existe."""
        with pytest.raises(HTTPException) as exc_info:
            delete_producto(session, 99999)
        
        assert exc_info.value.status_code == 404
        assert "no encontrado" in exc_info.value.detail
    
    def test_delete_producto_con_relaciones(self, session: Session, producto_fixture, inventario_fixture):
        """Debe lanzar excepción cuando el producto tiene relaciones activas."""
        producto_id = producto_fixture.id
        with pytest.raises(HTTPException) as exc_info:
            delete_producto(session, producto_id)
        
        assert exc_info.value.status_code == 400
        assert "No se puede eliminar" in exc_info.value.detail


class TestChangeEstadoProducto:
    """Tests para la función change_estado_producto."""
    
    def test_change_estado_producto_activar(self, session: Session, categoria_fixture):
        """Debe cambiar el estado de inactivo a activo."""
        producto = Producto(
            codigo="P999", nombre="Producto Inactivo", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id,
            estado=False
        )
        session.add(producto)
        session.commit()
        
        result = change_estado_producto(session, producto.id)
        
        assert result.estado == True
    
    def test_change_estado_producto_desactivar(self, session: Session, producto_fixture):
        """Debe cambiar el estado de activo a inactivo."""
        result = change_estado_producto(session, producto_fixture.id)
        
        assert result.estado == False
    
    def test_change_estado_producto_no_existente(self, session: Session):
        """Debe lanzar excepción cuando el producto no existe."""
        with pytest.raises(HTTPException) as exc_info:
            change_estado_producto(session, 99999)
        
        assert exc_info.value.status_code == 404
        assert "no encontrado" in exc_info.value.detail


class TestGetProductosInfinitoInventario:
    """Tests para la función get_productos_infinito_inventario."""
    
    def test_get_productos_infinito_inventario_sin_inventario(self, session: Session, producto_fixture):
        """Debe devolver productos que no tienen inventario."""
        result = get_productos_infinito_inventario(session)
        
        assert len(result) == 1
        assert result[0].id == producto_fixture.id
        assert result[0].nombre == "P001: Martillo"
    
    def test_get_productos_infinito_inventario_con_busqueda(self, session: Session, categoria_fixture):
        """Debe filtrar productos por búsqueda."""
        # Agregar producto adicional
        producto2 = Producto(
            codigo="P002", nombre="Destornillador", precio_unitario=5.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        session.add(producto2)
        session.commit()
        
        result = get_productos_infinito_inventario(session, search="Destorn")
        
        assert len(result) == 1
        assert "Destornillador" in result[0].nombre
    
    def test_get_productos_infinito_inventario_solo_activos(self, session: Session, categoria_fixture, producto_fixture):
        """Debe devolver solo productos activos."""
        producto_inactivo = Producto(
            codigo="P002", nombre="Producto Inactivo", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id,
            estado=False
        )
        session.add(producto_inactivo)
        session.commit()
        
        result = get_productos_infinito_inventario(session)
        
        # Solo debe devolver el producto activo del fixture
        assert len(result) == 1
        assert result[0].nombre == "P001: Martillo"
    
    def test_get_productos_infinito_inventario_paginacion(self, session: Session, categoria_fixture, producto_fixture):
        """Debe paginar correctamente."""
        # Crear productos adicionales
        productos = [
            Producto(codigo=f"P00{i}", nombre=f"Producto {i}", precio_unitario=10.0,
                    unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id)
            for i in range(2, 5)  # P002, P003, P004
        ]
        session.add_all(productos)
        session.commit()
        
        result = get_productos_infinito_inventario(session, skip=2, limit=2)
        
        assert len(result) == 2


class TestGetProductosInfinitoMovimiento:
    """Tests para la función get_productos_infinito_movimiento."""
    
    def test_get_productos_infinito_movimiento_basico(self, session: Session, producto_fixture):
        """Debe devolver productos activos."""
        result = get_productos_infinito_movimiento(session)
        
        assert len(result) == 1
        assert result[0].id == producto_fixture.id
        assert result[0].nombre == "P001: Martillo"
    
    def test_get_productos_infinito_movimiento_con_busqueda(self, session: Session, categoria_fixture):
        """Debe filtrar productos por búsqueda."""
        # Agregar producto adicional
        producto2 = Producto(
            codigo="P002", nombre="Destornillador", precio_unitario=5.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id
        )
        session.add(producto2)
        session.commit()
        
        result = get_productos_infinito_movimiento(session, search="P002")
        
        assert len(result) == 1
        assert "P002" in result[0].nombre
    
    def test_get_productos_infinito_movimiento_solo_activos(self, session: Session, categoria_fixture, producto_fixture):
        """Debe devolver solo productos activos."""
        producto_inactivo = Producto(
            codigo="P002", nombre="Producto Inactivo", precio_unitario=10.0,
            unidad_medida=UnidadMedida.UNIDAD, categoria_id=categoria_fixture.id,
            estado=False
        )
        session.add(producto_inactivo)
        session.commit()
        
        result = get_productos_infinito_movimiento(session)
        
        # Solo debe devolver el producto activo del fixture
        assert len(result) == 1
        assert result[0].nombre == "P001: Martillo"