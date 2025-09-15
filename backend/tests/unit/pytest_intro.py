# Configuración para pruebas unitarias con pytest

# Comandos de ejecución sugeridos (CLI o Makefile)
EXECUTION_COMMANDS = {
    "unit-all": "pytest -v tests/unit/services/",
    "unit-cov": (
        "pytest --cov=app.core "
        "--cov=app.models "
        "--cov=app.schemas "
        "--cov=app.services "
        "tests/unit/services/"
    ),
    "unit-categoria": "pytest -v tests/unit/services/test_categoria_service.py",
    "unit-cliente": "pytest -v tests/unit/services/test_cliente_service.py",
    "unit-exportar": "pytest -v tests/unit/services/test_exportar_service.py",
    "unit-inventario": "pytest -v tests/unit/services/test_inventario_service.py",
    "unit-producto": "pytest -v tests/unit/services/test_producto_service.py",
    "unit-security": "pytest -v tests/unit/services/test_security.py",
    "unit-usuario": "pytest -v tests/unit/services/test_usuario_service.py",
    "unit-venta": "pytest -v tests/unit/services/test_venta_service.py",
}

# Módulos a evaluar
MODULES = {
    "categorias": ["test_categoria_service.py"],
    "clientes": ["test_cliente_service.py"],
    "exportaciones": ["test_exportar_service.py"],
    "inventarios": ["test_inventario_service.py"],
    "productos": ["test_producto_service.py"],
    "seguridad": ["test_security.py"],
    "usuarios": ["test_usuario_service.py"],
    "ventas": ["test_venta_service.py"],
}

# Ajustes globales de la prueba
GLOBAL_SETTINGS = {
    "db": "sqlite en memoria",
    "reset": "reinicio de DB entre cada test",
    "total_tests": 290,
    "framework": "pytest + pytest-cov",
}


def print_execution_guide():
    """Imprime guía de ejecución para pruebas unitarias con pytest."""
    print("=== GUÍA DE PRUEBAS UNITARIAS CON PYTEST - SONYCO ===\n")

    print("COMANDOS DE PRUEBA DISPONIBLES (CLI o Makefile):")
    for name, command in EXECUTION_COMMANDS.items():
        print(f"  {name.upper()}:")
        print(f"    {command}")
        print(f"    OR")
        print(f"    make {name}\n")

    print("MÓDULOS A EVALUAR:")
    for module, tests in MODULES.items():
        print(f"  {module.upper()}: {', '.join(tests)}")

    print("\nAJUSTES GLOBALES DE LA PRUEBA:")
    for k, v in GLOBAL_SETTINGS.items():
        print(f"  - {k}: {v}")


if __name__ == "__main__":
    print_execution_guide()
