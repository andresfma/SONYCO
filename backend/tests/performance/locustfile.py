import random
import json
import time
from decimal import Decimal
from locust import HttpUser, task, between
from tests.performance.seed_test import NUM_USUARIOS

# Lista de usuarios generada según seed
USUARIOS = [
    {"email": f"user{i}@test.com", "password": "password123"}
    for i in range(NUM_USUARIOS)
]

# Usuario admin
USUARIOS.append({"email": "admin@admin.com", "password": "admin"})

# Datos de prueba - se poblarán dinámicamente
CLIENTES_CACHE = []
PRODUCTOS_CACHE = []
INVENTARIOS_CACHE = []
VENTAS_CREADAS = []

class AuthenticatedUser(HttpUser):
    abstract = True   # evita que se instancie directamente
    wait_time = between(1, 3)
    
    def on_start(self):
        """Se ejecuta cuando inicia cada usuario virtual"""
        self.login()
        self.populate_cache()
    
    def login(self):
        """Autenticación del usuario"""
        usuario = random.choice(USUARIOS)
        
        with self.client.post(
            "/api/v1/auth/login", 
            json=usuario,
            catch_response=True,
            name="POST /auth/login"
        ) as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.headers = {"Authorization": f"Bearer {self.token}"}
                response.success()
            else:
                response.failure(f"Login failed: {response.status_code}")
    
    def populate_cache(self):
        """Pobla los caches con datos existentes para usar en las pruebas"""
        global CLIENTES_CACHE, PRODUCTOS_CACHE, INVENTARIOS_CACHE
        
        # Solo poblar cache si está vacío (evitar múltiples llamadas)
        if not CLIENTES_CACHE:
            self.get_clientes_cache()
        if not PRODUCTOS_CACHE:
            self.get_productos_cache()
        if not INVENTARIOS_CACHE:
            self.get_inventarios_cache()
    
    def get_clientes_cache(self):
        """Obtiene lista de clientes para usar en pruebas"""
        global CLIENTES_CACHE
        response = self.client.get(
            "/api/v1/clientes/infinito?limit=20",
            headers=self.headers,
            name="Cache: GET /clientes/infinito"
        )
        if response.status_code == 200:
            CLIENTES_CACHE = response.json()[:10]  # Limitar a 10 para pruebas
    
    def get_productos_cache(self):
        """Obtiene lista de productos para usar en pruebas"""
        global PRODUCTOS_CACHE
        response = self.client.get(
            "/api/v1/productos/infinito/movimiento?limit=20",
            headers=self.headers,
            name="Cache: GET /productos/infinito/movimiento"
        )
        if response.status_code == 200:
            PRODUCTOS_CACHE = response.json()[:10]  # Limitar a 10 para pruebas
    
    def get_inventarios_cache(self):
        """Obtiene lista de inventarios para usar en pruebas"""
        global INVENTARIOS_CACHE
        response = self.client.get(
            "/api/v1/inventarios/?page_size=20",
            headers=self.headers,
            name="Cache: GET /inventarios/"
        )
        if response.status_code == 200:
            data = response.json()
            if 'items' in data:
                INVENTARIOS_CACHE = data['items'][:10]
    
    # ==================== MÉTODOS COMUNES (sin @task) ====================
    
    def get_auth_me(self):
        """Verificar usuario actual"""
        self.client.get(
            "/api/v1/auth/me",
            headers=self.headers,
            name="GET /auth/me"
        )
    
    def get_clientes_infinito(self):
        """Listar clientes infinito con parámetros aleatorios"""
        params = {
            "skip": random.randint(0, 10),
            "limit": random.choice([10, 25, 50]),
        }
        
        # 30% de las veces agregar búsqueda
        if random.random() < 0.3:
            params["search"] = random.choice(["test", "user", "empresa"])
        
        self.client.get(
            "/api/v1/clientes/infinito",
            params=params,
            headers=self.headers,
            name="GET /clientes/infinito"
        )
    
    def get_clientes_paginados(self):
        """Listar clientes con paginación"""
        params = {
            "page": random.randint(1, 3),
            "page_size": random.choice([10, 25, 50]),
            "sort_order": random.choice(["asc", "desc"])
        }
        
        # 40% de las veces agregar filtros
        if random.random() < 0.4:
            params["search"] = random.choice(["test", "user"])
            params["estado"] = random.choice([True, False])
        
        self.client.get(
            "/api/v1/clientes/",
            params=params,
            headers=self.headers,
            name="GET /clientes/"
        )
    
    def get_clientes_con_ventas(self):
        """Obtener total de clientes con ventas"""
        self.client.get(
            "/api/v1/clientes/con-ventas",
            headers=self.headers,
            name="GET /clientes/con-ventas"
        )
    
    def get_productos_infinito_inventario(self):
        """Listar productos para inventario"""
        params = {
            "skip": random.randint(0, 10),
            "limit": random.choice([10, 25, 50])
        }
        
        if random.random() < 0.3:
            params["search"] = random.choice(["producto", "test", "item"])
        
        self.client.get(
            "/api/v1/productos/infinito/inventario",
            params=params,
            headers=self.headers,
            name="GET /productos/infinito/inventario"
        )
    
    def get_productos_infinito_movimiento(self):
        """Listar productos para movimiento"""
        params = {
            "skip": random.randint(0, 10),
            "limit": random.choice([10, 25, 50])
        }
        
        if random.random() < 0.3:
            params["search"] = random.choice(["producto", "test", "item"])
        
        self.client.get(
            "/api/v1/productos/infinito/movimiento",
            params=params,
            headers=self.headers,
            name="GET /productos/infinito/movimiento"
        )
    
    def get_productos_paginados(self):
        """Listar productos con paginación"""
        params = {
            "page": random.randint(1, 3),
            "page_size": random.choice([10, 25]),
            "sort_order": random.choice(["asc", "desc"])
        }
        
        if random.random() < 0.4:
            params["search"] = random.choice(["producto", "test"])
            params["estado"] = random.choice([True, False])
        
        self.client.get(
            "/api/v1/productos/",
            params=params,
            headers=self.headers,
            name="GET /productos/"
        )
    
    def get_inventarios(self):
        """Listar inventarios"""
        params = {
            "page": random.randint(1, 3),
            "page_size": random.choice([10, 25]),
            "sort_order": random.choice(["asc", "desc"])
        }
        
        if random.random() < 0.3:
            params["search"] = random.choice(["producto", "test"])
        
        self.client.get(
            "/api/v1/inventarios/",
            params=params,
            headers=self.headers,
            name="GET /inventarios/"
        )
    
    def get_inventarios_stock_bajo(self):
        """Listar productos con stock bajo"""
        params = {
            "page": random.randint(1, 2),
            "page_size": random.choice([10, 25]),
        }
        
        self.client.get(
            "/api/v1/inventarios/stock-bajo",
            params=params,
            headers=self.headers,
            name="GET /inventarios/stock-bajo"
        )
    
    def get_ventas(self):
        """Listar ventas"""
        params = {
            "page": random.randint(1, 3),
            "page_size": random.choice([10, 25]),
            "sort_order": random.choice(["asc", "desc"])
        }
        
        if random.random() < 0.4:
            params["search"] = random.choice(["cliente", "user"])
            params["estado"] = random.choice([True, False])
        
        self.client.get(
            "/api/v1/ventas/",
            params=params,
            headers=self.headers,
            name="GET /ventas/"
        )
    
    def get_detalles_venta(self):
        """Obtener detalles de una venta aleatoria"""
        global VENTAS_CREADAS
        
        if VENTAS_CREADAS:
            venta_id = random.choice(VENTAS_CREADAS)
            params = {
                "page": 1,
                "page_size": 10
            }
            
            self.client.get(
                f"/api/v1/ventas/detalles/{venta_id}",
                params=params,
                headers=self.headers,
                name="GET /ventas/detalles/{venta_id}"
            )
    
    def crear_venta_completa(self):
        """Flujo completo: crear venta y agregar detalles"""
        global CLIENTES_CACHE, PRODUCTOS_CACHE, VENTAS_CREADAS
        
        if not CLIENTES_CACHE:
            return
        
        # 1. Crear venta
        cliente = random.choice(CLIENTES_CACHE)
        venta_data = {"cliente_id": cliente["id"]}
        
        venta_id = None
        
        with self.client.post(
            "/api/v1/ventas/",
            json=venta_data,
            headers=self.headers,
            name="POST /ventas/",
            catch_response=True
        ) as response:
            if response.status_code == 201:
                venta = response.json()
                venta_id = venta["id"]
                VENTAS_CREADAS.append(venta_id)
                response.success()
            else:
                response.failure(f"Error creating venta: {response.status_code}")
        
        if venta_id:
            self.agregar_detalles_venta(venta_id)
    
    def agregar_detalles_venta(self, venta_id):
        """Agregar detalles a una venta existente"""
        global PRODUCTOS_CACHE
        
        if not PRODUCTOS_CACHE:
            return
        
        num_detalles = random.randint(1, 3)
        productos_usados = []
        
        for _ in range(num_detalles):
            productos_disponibles = [p for p in PRODUCTOS_CACHE if p["id"] not in productos_usados]
            if not productos_disponibles:
                break
                
            producto = random.choice(productos_disponibles)
            productos_usados.append(producto["id"])
            
            detalle_data = {
                "producto_id": producto["id"],
                "cantidad": random.randint(1, 5)
            }
            
            self.client.post(
                f"/api/v1/detalle_venta/{venta_id}",
                json=detalle_data,
                headers=self.headers,
                name="POST /detalle_venta/{venta_id}"
            )
    
    def registrar_entrada_inventario(self):
        """Registrar entrada de inventario"""
        global PRODUCTOS_CACHE
        
        if not PRODUCTOS_CACHE or not self.token:
            return
        
        producto = random.choice(PRODUCTOS_CACHE)
        entrada_data = {
            "producto_id": producto["id"],
            "cantidad": random.randint(20, 50),
            "motivo": random.choice(["Compra", "Ajuste", "Devolución"])
        }
        
        with self.client.post(
            "/api/v1/inventarios/movimientos/entrada",
            json=entrada_data,
            headers=self.headers,
            name="POST /inventarios/movimientos/entrada",
            catch_response=True
        ) as response:
            if response.status_code not in [200, 201]:
                response.failure(f"Error entrada inventario: {response.status_code}")
            else:
                response.success()
    
    def registrar_salida_inventario(self):
        """Registrar salida de inventario"""
        global INVENTARIOS_CACHE
        
        if not INVENTARIOS_CACHE or not self.token:
            return
        
        inventarios_con_stock = [
            inv for inv in INVENTARIOS_CACHE 
            if inv.get('cantidad', 0) >= 20
        ]
        
        if not inventarios_con_stock:
            return
        
        inventario = random.choice(inventarios_con_stock)
        max_cantidad = min(5, inventario.get('cantidad', 1) // 2)
        cantidad = random.randint(1, max(1, max_cantidad))
        
        salida_data = {
            "producto_id": inventario.get('producto_id'),
            "cantidad": cantidad,
            "motivo": random.choice(["Venta", "Ajuste", "Pérdida"])
        }
        
        with self.client.post(
            "/api/v1/inventarios/movimientos/salida",
            json=salida_data,
            headers=self.headers,
            name="POST /inventarios/movimientos/salida",
            catch_response=True
        ) as response:
            if response.status_code not in [200, 201]:
                response.failure(f"Error salida inventario: {response.status_code}")
            else:
                response.success()
        
        inventario['cantidad'] = max(0, inventario.get('cantidad', 0) - cantidad)


# ==================== USUARIO NORMAL (80% del tráfico) ====================

class UsuarioNormal(AuthenticatedUser):
    """Usuario que simula comportamiento normal del sistema - 80% del tráfico"""
    weight = 80  # 80% de los usuarios
    wait_time = between(1, 4)  # Comportamiento típico de navegación
    
    # ==================== ENDPOINTS DE CONSULTA (70% de las operaciones) ====================
    
    @task(6)
    def task_auth_me(self):
        """Verificar usuario actual"""
        self.get_auth_me()
    
    @task(9)
    def task_clientes_infinito(self):
        """Búsqueda de clientes - operación muy común"""
        self.get_clientes_infinito()
    
    @task(6)
    def task_clientes_paginados(self):
        """Listado paginado de clientes"""
        self.get_clientes_paginados()
    
    @task(3)
    def task_clientes_con_ventas(self):
        """Reporte de clientes con ventas"""
        self.get_clientes_con_ventas()
    
    @task(9)
    def task_productos_infinito_inventario(self):
        """Búsqueda de productos para inventario"""
        self.get_productos_infinito_inventario()
    
    @task(9)
    def task_productos_infinito_movimiento(self):
        """Búsqueda de productos para movimientos"""
        self.get_productos_infinito_movimiento()
    
    @task(6)
    def task_productos_paginados(self):
        """Listado paginado de productos"""
        self.get_productos_paginados()
    
    @task(8)
    def task_inventarios(self):
        """Consulta de inventarios"""
        self.get_inventarios()
    
    @task(5)
    def task_inventarios_stock_bajo(self):
        """Reporte de stock bajo - importante para operaciones"""
        self.get_inventarios_stock_bajo()
    
    @task(8)
    def task_ventas(self):
        """Listado de ventas"""
        self.get_ventas()
    
    @task(3)
    def task_detalles_venta(self):
        """Consulta detalles de ventas específicas"""
        self.get_detalles_venta()
    
    # ==================== OPERACIONES DE CREACIÓN (20% de las operaciones) ====================
    
    @task(15)
    def task_crear_venta_completa(self):
        """Crear venta con detalles - flujo principal del negocio"""
        self.crear_venta_completa()
    
    # ==================== GESTIÓN DE INVENTARIO (10% de las operaciones) ====================
    
    @task(5)
    def task_entrada_inventario(self):
        """Registrar entrada de inventario"""
        self.registrar_entrada_inventario()
    
    @task(3)
    def task_salida_inventario(self):
        """Registrar salida de inventario"""
        self.registrar_salida_inventario()


# ==================== FLUJO COMPLETO CONTROLADO (20% del tráfico) ====================

class UsuarioConFlujoCompleto(AuthenticatedUser):
    """Usuario que ejecuta flujos completos de venta de manera controlada - 20% del tráfico"""
    weight = 20  # 20% de los usuarios
    wait_time = between(2, 6)  # Flujos más pausados, simulando usuarios reales
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.flujos_ejecutados = 0
        self.max_flujos = random.randint(2, 4)  # Entre 2-4 flujos por usuario
        self.user_id = random.randint(1000, 9999)
        
    def on_start(self):
        """Inicialización del usuario de flujo"""
        super().on_start()
        print(f"👤 Usuario flujo {self.user_id} iniciado - Target: {self.max_flujos} flujos")
    
    @task
    def ejecutar_flujo_venta_completo(self):
        """Ejecuta un flujo completo de venta paso a paso"""
        
        # Verificar si ya completó todos los flujos
        if self.flujos_ejecutados >= self.max_flujos:
            print(f"🏁 Usuario {self.user_id} completó {self.flujos_ejecutados} flujos - Deteniéndose")
            self.stop(force=True)
            return
        
        flujo_id = self.flujos_ejecutados + 1
        print(f"🚀 Usuario {self.user_id} - Iniciando flujo #{flujo_id}/{self.max_flujos}")
        
        # ==================== PASO 1: BUSCAR CLIENTE ====================
        print(f"📍 Usuario {self.user_id} - Flujo #{flujo_id}: Buscando cliente")
        self.client.get(
            "/api/v1/clientes/infinito?search=test&limit=10",
            headers=self.headers,
            name="Flow: Buscar cliente"
        )
        time.sleep(random.uniform(0.5, 1.5))  # Tiempo realista entre acciones
        
        # ==================== PASO 2: BUSCAR PRODUCTOS ====================
        print(f"📍 Usuario {self.user_id} - Flujo #{flujo_id}: Buscando productos")
        self.client.get(
            "/api/v1/productos/infinito/movimiento?limit=20",
            headers=self.headers,
            name="Flow: Buscar productos"
        )
        time.sleep(random.uniform(0.5, 1.5))
        
        # ==================== PASO 3: CREAR VENTA ====================
        print(f"📍 Usuario {self.user_id} - Flujo #{flujo_id}: Creando venta")
        venta_id = None
        global CLIENTES_CACHE
        
        if CLIENTES_CACHE:
            cliente = random.choice(CLIENTES_CACHE)
            venta_data = {"cliente_id": cliente["id"]}
            
            with self.client.post(
                "/api/v1/ventas/",
                json=venta_data,
                headers=self.headers,
                name="Flow: Crear venta",
                catch_response=True
            ) as response:
                if response.status_code == 201:
                    venta_id = response.json()["id"]
                    print(f"💰 Usuario {self.user_id} - Flujo #{flujo_id}: Venta creada con ID {venta_id}")
                    response.success()
                else:
                    print(f"❌ Usuario {self.user_id} - Error creando venta: {response.status_code}")
                    response.failure(f"Error creating venta: {response.status_code}")
        
        time.sleep(random.uniform(0.5, 1.0))
        
        # ==================== PASO 4: AGREGAR PRODUCTOS ====================
        print(f"📍 Usuario {self.user_id} - Flujo #{flujo_id}: Agregando productos")
        global PRODUCTOS_CACHE
        
        if venta_id and PRODUCTOS_CACHE:
            num_productos = random.randint(2, 3)  # Entre 2-3 productos por venta
            productos_agregados = 0
            productos_usados = set()
            
            for i in range(num_productos):
                # Evitar productos duplicados en la misma venta
                productos_disponibles = [p for p in PRODUCTOS_CACHE if p["id"] not in productos_usados]
                if not productos_disponibles:
                    print(f"⚠️ Usuario {self.user_id} - No hay más productos disponibles")
                    break
                
                producto = random.choice(productos_disponibles)
                productos_usados.add(producto["id"])
                
                detalle_data = {
                    "producto_id": producto["id"],
                    "cantidad": random.randint(1, 3)
                }
                
                with self.client.post(
                    f"/api/v1/detalle_venta/{venta_id}",
                    json=detalle_data,
                    headers=self.headers,
                    name="Flow: Agregar producto",
                    catch_response=True
                ) as response:
                    if response.status_code in [200, 201]:
                        productos_agregados += 1
                        print(f"🛒 Usuario {self.user_id} - Producto {productos_agregados} agregado a venta {venta_id}")
                        response.success()
                    else:
                        print(f"❌ Usuario {self.user_id} - Error agregando producto: {response.status_code}")
                        response.failure(f"Error adding product: {response.status_code}")
                
                time.sleep(random.uniform(0.3, 0.8))  # Pausa entre productos
        
        time.sleep(random.uniform(0.5, 1.0))
        
        # ==================== PASO 5: VERIFICAR VENTA ====================
        print(f"📍 Usuario {self.user_id} - Flujo #{flujo_id}: Verificando venta")
        
        if venta_id:
            with self.client.get(
                f"/api/v1/ventas/detalles/{venta_id}",
                headers=self.headers,
                name="Flow: Verificar venta",
                catch_response=True
            ) as response:
                if response.status_code == 200:
                    print(f"✅ Usuario {self.user_id} - Venta {venta_id} verificada correctamente")
                    response.success()
                else:
                    print(f"❌ Usuario {self.user_id} - Error verificando venta: {response.status_code}")
                    response.failure(f"Error verifying venta: {response.status_code}")
        
        # ==================== COMPLETAR FLUJO ====================
        self.flujos_ejecutados += 1
        print(f"🎯 Usuario {self.user_id} - Flujo #{flujo_id} COMPLETADO! Total: {self.flujos_ejecutados}/{self.max_flujos}")
        
        # Si completó todos los flujos objetivo, detener el usuario
        if self.flujos_ejecutados >= self.max_flujos:
            print(f"🏁 Usuario {self.user_id} - Todos los flujos completados ({self.flujos_ejecutados}). Finalizando usuario.")
            time.sleep(1)  # Pequeña pausa antes de detenerse
            self.stop(force=True)
    
    def on_stop(self):
        """Se ejecuta cuando el usuario se detiene"""
        print(f"🛑 Usuario {self.user_id} detenido - Ejecutó {self.flujos_ejecutados} flujos de {self.max_flujos} planeados")


