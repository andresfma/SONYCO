# Configuración para pruebas de rendimiento en entorno local

# Configuración de usuarios para pruebas escaladas
TESTING_PROFILES = {
    "low": {
        "users": 5,
        "spawn_rate": 1,
        "run_time": "5m",
        "description": "Prueba con estrés bajo"
    },
    "medium": {
        "users": 20,
        "spawn_rate": 2,
        "run_time": "10m", 
        "description": "Prueba con estrés medio"
    },
    "high": {
        "users": 50,
        "spawn_rate": 5,
        "run_time": "15m",
        "description": "Prueba con estrés alto"
    }
}

# Configuración de endpoints por módulo (para análisis)
ENDPOINT_MODULES = {
    "auth": ["POST /auth/login", "GET /auth/me"],
    "clientes": [
        "GET /clientes/infinito", 
        "GET /clientes/", 
        "GET /clientes/con-ventas"
    ],
    "productos": [
        "GET /productos/infinito/inventario",
        "GET /productos/infinito/movimiento", 
        "GET /productos/"
    ],
    "inventarios": [
        "POST /inventarios/movimientos/entrada",
        "POST /inventarios/movimientos/salida",
        "GET /inventarios/",
        "GET /inventarios/stock-bajo"
    ],
    "ventas": [
        "GET /ventas/",
        "POST /ventas/",
        "GET /ventas/detalles/{venta_id}",
        "POST /detalle_venta/{venta_id}"
    ]
}

# Scripts de ejecución sugeridos
EXECUTION_COMMANDS = {
    "low": "locust -f tests/performance/locustfile.py --host=http://localhost:8000 --users 5 --spawn-rate 1 --run-time 5m --headless --html=report_low.html",
    "medium": "locust -f tests/performance/locustfile.py --host=http://localhost:8000 --users 20 --spawn-rate 2 --run-time 10m --headless --html=report_medium.html",
    "high": "locust -f tests/performance/locustfile.py --host=http://localhost:8000 --users 50 --spawn-rate 5 --run-time 15m --headless --html=report_high.html",
    "interactivo": "locust -f tests/performance/locustfile.py --host=http://localhost:8000"
}

# Métricas clave a monitorear para el proyecto académico
KEY_METRICS = {
    "performance": [
        "Average Response Time",
        "95th Percentile Response Time", 
        "Requests per Second",
        "Failure Rate"
    ],
    "thresholds": {
        "max_response_time_ms": 3000,  # Máximo 3 segundos para entorno local
        "max_failure_rate": 5,         # Máximo 5% de errores
        "min_rps": 5                   # Mínimo 5 requests por segundo
    }
}

# Configuración final de usuarios para pruebas realistas
USER_CONFIG = {
    "UsuarioNormal": {
        "weight": 80,
        "trafico": "80% del tráfico",
        "mix": "70% consultas (GET), 20% ventas (POST), 10% movimientos inventario (POST)",
        "detalle": "Operaciones aleatorias típicas del sistema"
    },
    "UsuarioConFlujoCompleto": {
        "weight": 20,
        "trafico": "20% del tráfico",
        "flujos": "2-4 flujos por usuario",
        "detalle": "Flujos de ventas controlados y determinísticos, con logging detallado"
    }
}

EXAMPLES = {
    "mixto": "locust -f archivo.py --users=10 --spawn-rate=2 --run-time=120s",
    "solo_normales": "# Comentar UsuarioConFlujoCompleto, solo usar UsuarioNormal",
    "solo_flujos": "# Comentar UsuarioNormal, solo usar UsuarioConFlujoCompleto",
    "resultados esperados": """
    RESULTADOS (10 usuarios, 120s):
    - UsuarioNormal: 8 usuarios con operaciones aleatorias
    - UsuarioConFlujoCompleto: 2 usuarios, cada uno con 2-4 flujos = 4-8 flujos totales
    - Flow requests: predictibles y consistentes
    - Mix de carga realista: consultas + transacciones
    """
}

def print_execution_guide():
    """Imprime guía de ejecución para pruebas de rendimiento."""
    print("=== GUÍA DE PRUEBAS DE RENDIMIENTO CON LOCUST - SONYCO ===\n")
    
    print("PERFILES DE PRUEBA DISPONIBLES:")
    for name, config in TESTING_PROFILES.items():
        print(f"  {name.upper()}: {config['users']} usuarios, {config['run_time']}")
        print(f"    {config['description']}\n")
    
    print("COMANDOS SUGERIDOS (CLI o Makefile):")
    for name, command in EXECUTION_COMMANDS.items():
        print(f"  {name.upper()}:")
        print(f"    {command}")
        print(f"    OR")
        print(f"    make locust-{name}\n")
    
    print("MÓDULOS A EVALUAR:")
    for module, endpoints in ENDPOINT_MODULES.items():
        print(f"  {module.upper()}: {len(endpoints)} endpoints")
    
    print(f"\nUMBRALES ESPERADOS PARA ENTORNO LOCAL:")
    print(f"  - Tiempo respuesta máximo: {KEY_METRICS['thresholds']['max_response_time_ms']}ms")
    print(f"  - Tasa de error máxima: {KEY_METRICS['thresholds']['max_failure_rate']}%")
    print(f"  - RPS mínimo esperado: {KEY_METRICS['thresholds']['min_rps']}")
    
    print("\n=== AJUSTES GLOBALES DE LA PRUEBA ===")
    print("\nCONFIGURACIÓN FINAL DE USUARIOS:")
    for user, details in USER_CONFIG.items():
        print(f"  {user}:")
        for k, v in details.items():
            print(f"    - {k}: {v}")
        print()
    
    print("CASOS DE USO PARA DEDUB:")
    for name, example in EXAMPLES.items():
        print(f"  {name.upper()}: {example}\n")

if __name__ == "__main__":
    print_execution_guide()
