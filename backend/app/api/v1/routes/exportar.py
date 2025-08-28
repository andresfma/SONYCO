from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from datetime import datetime
from sqlmodel import Session
from app.db.session import get_session
from app.api.dependencies import get_current_user, get_current_admin_user
from app.services.cliente_service import get_cliente_by_id
from app.services.producto_service import get_producto_by_id
from app.services.usuario_service import get_usuario_by_id
from app.services.exportar_service import (
    exportar_inventario,
    exportar_ventas,
    exportar_productos,
    exportar_usuarios,
    exportar_clientes,
    exportar_movimientos_por_producto,
    exportar_movimientos_por_usuario,
    exportar_ventas_por_cliente,
    exportar_detalle_venta_por_venta_id,
    exportar_movimientos_inventario,
    exportar_categorias
)
from app.core.config import COL_TZ
from app.schemas.shared import ErrorResponse

router = APIRouter()


@router.get(
        "/inventarios", 
        response_class=StreamingResponse, 
        summary="Exportar inventario",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_inventario(
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    output = exportar_inventario(db)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Inventario_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
        "/ventas", 
        response_class=StreamingResponse, 
        summary="Exportar ventas",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_ventas(
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    output = exportar_ventas(db)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Ventas_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
        "/ventas/cliente/{cliente_id}", 
        response_class=StreamingResponse, 
        summary="Exportar ventas por cliente",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_ventas_por_cliente(
    cliente_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    output = exportar_ventas_por_cliente(db, cliente_id)
    cliente = get_cliente_by_id(db, cliente_id)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Ventas_Cliente_ID_{cliente.identificacion}_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
        "/clientes", 
        response_class=StreamingResponse, 
        summary="Exportar clientes",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_clientes(
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    output = exportar_clientes(db)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Cliente_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
        "/categorias", 
        response_class=StreamingResponse, 
        summary="Exportar categorias",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_categorias(
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    output = exportar_categorias(db)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Categorias_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
        "/productos", 
        response_class=StreamingResponse, 
        summary="Exportar productos",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_productos(
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    output = exportar_productos(db)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Productos_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
    

@router.get(
        "/usuarios", 
        response_class=StreamingResponse, 
        summary="Exportar usuarios",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_usuarios(
    db: Session = Depends(get_session),
    admin=Depends(get_current_admin_user)
):
    output = exportar_usuarios(db)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Usuarios_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
        "/movimientos/producto/{producto_id}", 
        response_class=StreamingResponse, 
        summary="Exportar movimientos de producto",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_movimientos_producto(
    producto_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    output = exportar_movimientos_por_producto(db, producto_id)
    producto = get_producto_by_id(db, producto_id)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Movimientos_Producto_COD_{producto.codigo}_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
    
    
@router.get(
        "/movimientos/usuario/{usuario_id}", 
        response_class=StreamingResponse, 
        summary="Exportar movimientos de producto",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_movimientos_producto(
    usuario_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    output = exportar_movimientos_por_usuario(db, usuario_id)
    usuario = get_usuario_by_id(db, usuario_id)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Movimientos_Usuario_{usuario.nombre}_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
        "/movimiento_inventarios", 
        response_class=StreamingResponse, 
        summary="Exportar todos los movimientos de inventario",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_movimientos_inventario(
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    output = exportar_movimientos_inventario(db)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Movimientos_Inventarios_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
        "/detalles/{venta_id}", 
        response_class=StreamingResponse,
        summary="Exportar detalle de venta por ID",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            500: {
                "description": "Error al generar el inventario",
                "model": ErrorResponse,
            },
        }
        )
def descargar_detalle_venta(
    venta_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    output = exportar_detalle_venta_por_venta_id(db, venta_id)

    # Usar la zona horaria definida en config
    fecha_colombia = datetime.now(COL_TZ).strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Venta_{venta_id}_Detalles_{fecha_colombia}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
    
    
