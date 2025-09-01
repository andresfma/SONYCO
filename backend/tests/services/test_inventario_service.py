import pytest
from fastapi import HTTPException

from app.schemas.inventario import (
    InventarioCantidadCreate,
    InventarioCantidadUpdate,
    InventarioRead,
    InventarioReadDetail,
)
from app.schemas.movimiento_inventario import MovimientoInventarioCreate
from app.models.movimiento_inventario import MovimientoInventario, TipoMovimientoEnum

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
)


# -------------------------------
# get_inventarios
# -------------------------------

def test_get_inventarios_retorna_lista(session, inventario_fixture):
    result = get_inventarios(db=session, page=1, page_size=10)
    assert result.total == 1
    assert len(result.items) == 1
    assert result.items[0].id == inventario_fixture.id


def test_get_inventarios_filtra_por_estado(session, inventario_fixture):
    inventario_fixture.estado = False
    session.commit()
    result = get_inventarios(db=session, estado=True)
    assert result.total == 0


# -------------------------------
# get_inventario_by_product_id
# -------------------------------

def test_get_inventario_by_product_id_existente(session, inventario_fixture):
    inventario = get_inventario_by_product_id(session, inventario_fixture.producto_id)
    assert inventario is not None
    assert inventario.producto_id == inventario_fixture.producto_id


def test_get_inventario_by_product_id_inexistente(session):
    inventario = get_inventario_by_product_id(session, producto_id=999)
    assert inventario is None


# -------------------------------
# Registrar inventario
# -------------------------------

def test_register_inventario_crea_nuevo(session, producto_fixture):
    data = InventarioCantidadCreate(producto_id=producto_fixture.id, cantidad=50, cantidad_minima=5)
    inventario = register_inventario(session, data)
    assert inventario.cantidad == 50
    assert inventario.producto_id == producto_fixture.id


def test_register_inventario_producto_no_existente(session):
    data = InventarioCantidadCreate(producto_id=999, cantidad=50)
    with pytest.raises(HTTPException) as exc:
        register_inventario(session, data)
    assert exc.value.status_code == 404


# -------------------------------
# Registrar entrada
# -------------------------------

def test_register_entrada_aumenta_stock(session, inventario_fixture, usuario_fixture):
    data = MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=20)
    movimiento = register_entrada(session, data, usuario_fixture)
    assert movimiento.cantidad == 20
    assert movimiento.cantidad_inventario == inventario_fixture.cantidad


def test_register_entrada_inventario_inactivo(session, inventario_fixture, usuario_fixture):
    inventario_fixture.estado = False
    session.commit()
    data = MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=10)
    with pytest.raises(HTTPException) as exc:
        register_entrada(session, data, usuario_fixture)
    assert exc.value.status_code == 400


# -------------------------------
# Registrar salida
# -------------------------------

def test_register_salida_disminuye_stock(session, inventario_fixture, usuario_fixture):
    data = MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=10)
    movimiento = register_salida(session, data, usuario_fixture)
    assert movimiento.cantidad == 10
    assert movimiento.cantidad_inventario == inventario_fixture.cantidad


def test_register_salida_stock_insuficiente(session, inventario_fixture, usuario_fixture):
    data = MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=9999)
    with pytest.raises(HTTPException) as exc:
        register_salida(session, data, usuario_fixture)
    assert exc.value.status_code == 400


# -------------------------------
# Update inventario
# -------------------------------

def test_update_inventario_cambia_cantidad(session, inventario_fixture, usuario_fixture):
    data = InventarioCantidadUpdate(cantidad=200)
    inventario = update_inventario(session, inventario_fixture.id, data, usuario_fixture)
    assert inventario.cantidad == 200


def test_update_inventario_inexistente(session, usuario_fixture):
    data = InventarioCantidadUpdate(cantidad=100)
    with pytest.raises(HTTPException) as exc:
        update_inventario(session, inventario_id=999, data=data, current_user=usuario_fixture)
    assert exc.value.status_code == 404


# -------------------------------
# Update inventario
# -------------------------------

def test_change_estado_inventario_toggle(session, inventario_fixture):
    estado_inicial = inventario_fixture.estado
    inventario = change_estado_inventario(session, inventario_fixture.id)
    assert inventario.estado == (not estado_inicial)


# -------------------------------
# get_historial_movimientos_by_producto
# -------------------------------

def test_get_historial_movimientos_by_producto(session, inventario_fixture, usuario_fixture):
    # Creamos una entrada y salida
    data_entrada = MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=5)
    register_entrada(session, data_entrada, usuario_fixture)

    data_salida = MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=2)
    register_salida(session, data_salida, usuario_fixture)

    result = get_historial_movimientos_by_producto(session, producto_id=inventario_fixture.producto_id, page=1, page_size=10)

    assert result.total == 2
    assert len(result.items) == 2
    assert all(m.producto.id == inventario_fixture.producto_id for m in result.items)


def test_get_historial_movimientos_by_producto_filtrado_por_tipo(session, inventario_fixture, usuario_fixture):
    # Creamos solo entradas
    for _ in range(2):
        data = MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=3)
        register_entrada(session, data, usuario_fixture)

    result = get_historial_movimientos_by_producto(
        session, 
        producto_id=inventario_fixture.producto_id, 
        tipo=TipoMovimientoEnum.ENTRADA
    )

    assert result.total == 2
    assert all(m.tipo == TipoMovimientoEnum.ENTRADA for m in result.items)


# -------------------------------
# get_historial_movimientos_by_usuario
# -------------------------------

def test_get_historial_movimientos_by_usuario(session, inventario_fixture, usuario_fixture):
    data = MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=5)
    register_entrada(session, data, usuario_fixture)

    result = get_historial_movimientos_by_usuario(session, usuario_id=usuario_fixture.id)

    assert result.total == 1
    assert result.items[0].usuario.id == usuario_fixture.id


def test_get_historial_movimientos_by_usuario_filtrado_por_tipo(session, inventario_fixture, usuario_fixture):
    data = MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=2)
    register_salida(session, data, usuario_fixture)

    result = get_historial_movimientos_by_usuario(
        session, 
        usuario_id=usuario_fixture.id, 
        tipo=TipoMovimientoEnum.SALIDA
    )

    assert result.total == 1
    assert result.items[0].tipo == TipoMovimientoEnum.SALIDA


# -------------------------------
# get_movimientos_inventario
# -------------------------------

def test_get_movimientos_inventario_retorna_todos(session, inventario_fixture, usuario_fixture):
    # Creamos varios movimientos
    register_entrada(session, MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=5), usuario_fixture)
    register_salida(session, MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=2), usuario_fixture)

    result = get_movimientos_inventario(session, page=1, page_size=10)

    assert result.total == 2
    assert len(result.items) == 2


def test_get_movimientos_inventario_busqueda(session, inventario_fixture, usuario_fixture):
    register_entrada(session, MovimientoInventarioCreate(producto_id=inventario_fixture.producto_id, cantidad=5), usuario_fixture)

    result = get_movimientos_inventario(session, search="Martillo")

    assert result.total >= 1
    assert any("Martillo" in m.producto.nombre for m in result.items)


# -------------------------------
# get_inventarios_stock_bajo
# -------------------------------

def test_get_inventarios_stock_bajo(session, inventario_fixture):
    # Dejamos el inventario con stock bajo
    inventario_fixture.cantidad = 5
    session.commit()

    result = get_inventarios_stock_bajo(session, page=1, page_size=10)

    assert result.total == 1
    assert result.items[0].cantidad < result.items[0].cantidad_minima


def test_get_inventarios_stock_bajo_busqueda(session, inventario_fixture):
    inventario_fixture.cantidad = 3
    session.commit()

    result = get_inventarios_stock_bajo(session, search="Martillo")

    assert result.total == 1
    assert "Martillo" in result.items[0].producto.nombre

