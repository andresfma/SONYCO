from fastapi import APIRouter
from app.api.v1.routes import (
    auth, 
    usuario, 
    cliente, 
    producto, 
    inventario, 
    venta, 
    exportar, 
    detalle_venta,
    categoria
)

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(usuario.router, prefix="/usuarios", tags=["Usuarios"])
router.include_router(cliente.router, prefix="/clientes", tags=["Clientes"])
router.include_router(producto.router, prefix="/productos", tags=["Productos"])
router.include_router(categoria.router, prefix="/categorias", tags=["Categorías"])
router.include_router(inventario.router, prefix="/inventarios", tags=["Inventarios"])
router.include_router(venta.router, prefix="/ventas", tags=["Ventas"])
router.include_router(detalle_venta.router, prefix="/detalle_venta", tags=["Detalle Venta"])
router.include_router(exportar.router, prefix="/exportar", tags=["Exportar"])


@router.get("/", tags=["Health"])
def health():
    return {"status": "ok", "message": "API is running"}