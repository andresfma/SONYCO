import { Routes, Route, Navigate } from "react-router-dom";
import { NotificationProvider } from "../context/NotificationContext";
import { NotificationContainer } from "../components/Notification/NotificationContainer";
import Login from "../pages/Login";
import Register from "../pages/Register";
// Dashboard
import Dashboard from "../pages/Dashboard";
// Perfil
import PerfilDetalle from "../pages/Perfil";
// Productos
import Productos from "../pages/Productos/Productos";
import ProductoDetalle from "../pages/Productos/ProductoDetalle";
import ProductoEditar from "../pages/Productos/ProductoEditar";
import ProductoCrear from "../pages/Productos/ProductoCrear";
// Clientes
import Clientes from "../pages/Clientes/Clientes";
import ClienteDetalle from "../pages/Clientes/ClienteDetalle";
import ClienteEditar from "../pages/Clientes/ClienteEditar";
import ClienteCrear from "../pages/Clientes/ClienteCrear";
// Usuarios
import Usuarios from "../pages/Usuarios/Usuarios";
import UsuarioDetalle from "../pages/Usuarios/UsuarioDetalle";
import UsuarioEditar from "../pages/Usuarios/UsuarioEdit";
import UsuarioCrear from "../pages/Usuarios/UsuarioCrear";
// Ventas
import Ventas from "../pages/Ventas/Ventas";
import VentaDetalle from "../pages/Ventas/VentaDetalle";
import VentaEditar from "../pages/Ventas/VentaEditar";
import VentaCrear from "../pages/Ventas/VentaCrear";
// Categorias
import Categorias from "../pages/Categorias/Categorias";
import CategoriaDetalle from "../pages/Categorias/CategoriaDetalle";
import CategoriaEditar from "../pages/Categorias/CategoriaEditar";
import CategoriaCrear from "../pages/Categorias/CategoriaCrear";
// Inventarios
import Inventarios from "../pages/Inventarios/Inventarios";
import InventarioDetalle from "../pages/Inventarios/InventarioDetalle";
import InventarioEditar from "../pages/Inventarios/InventarioEditar";
import InventarioCrear from "../pages/Inventarios/InventarioCrear";
// Movimientos
import MovimientoInventarios from "../pages/MovimientoInventarios/MovimientoInventarios";
import MovimientoInventarioDetalle from "../pages/MovimientoInventarios/MovimientoInventarioDetalle";
import MovimientoInventarioEntrada from "../pages/MovimientoInventarios/MovimientoInventarioEntrada";
import MovimientoInventarioSalida from "../pages/MovimientoInventarios/MovimientoInventarioSalida";
// Detalle-ventas
import DetalleVentaCrear from "../pages/DetalleVentas/DetalleVentaCrear";
import DetalleVentaEditar from "../pages/DetalleVentas/DetalleVentaEditar";
// Help
import About from "../pages/About";
// Routes
import PrivateRoute from "./PrivateRoute";
import MainLayout from "../layouts/MainLayout";
import AdminRoute from "./AdminRoute";


function AppRoutes() {
  return (
    <NotificationProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas privadas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Rutas de Productos */}
          <Route path="productos" element={<Productos />} />
          <Route path="productos/:id" element={<ProductoDetalle />} />
          <Route path="productos/:id/editar" element={<ProductoEditar />} />
          <Route path="productos/crear" element={<ProductoCrear />} />
          
          {/* Rutas de Clientes*/}
          <Route path="clientes" element={<Clientes />} />
          <Route path="clientes/:id" element={<ClienteDetalle />} />
          <Route path="clientes/:id/editar" element={<ClienteEditar />} />
          <Route path="clientes/crear" element={<ClienteCrear />} />

          {/* Rutas de Usuarios*/}
          <Route path="usuarios" element={<AdminRoute> <Usuarios /> </AdminRoute>} />
          <Route path="usuarios/:id" element={<AdminRoute> <UsuarioDetalle /> </AdminRoute>} />
          <Route path="usuarios/:id/editar" element={<AdminRoute> <UsuarioEditar /> </AdminRoute>} />
          <Route path="usuarios/crear" element={<AdminRoute> <UsuarioCrear /> </AdminRoute>} />

          {/* Rutas de Ventas*/}
          <Route path="ventas" element={<Ventas />} />
          <Route path="ventas/:id" element={<VentaDetalle />} />
          <Route path="ventas/:id/editar" element={<VentaEditar />} />
          <Route path="ventas/crear" element={<VentaCrear />} />

          {/* Rutas de categorias*/}
          <Route path="categorias" element={<Categorias />} />
          <Route path="categorias/:id" element={<CategoriaDetalle />} />
          <Route path="categorias/:id/editar" element={<CategoriaEditar />} />
          <Route path="categorias/crear" element={<CategoriaCrear />} />

          {/* Rutas de inventarios*/}
          <Route path="inventarios" element={<Inventarios />} />
          <Route path="inventarios/:id" element={<InventarioDetalle />} />
          <Route path="inventarios/:id/editar" element={<InventarioEditar />} />
          <Route path="inventarios/crear" element={<InventarioCrear />} />

          {/* Rutas de movimientos*/}
          <Route path="movimientos" element={<MovimientoInventarios />} />
          <Route path="movimientos/:id" element={<MovimientoInventarioDetalle />} />
          <Route path="movimientos/crear/entrada" element={<MovimientoInventarioEntrada />} />
          <Route path="movimientos/crear/salida" element={<MovimientoInventarioSalida />} />
          
          {/* Rutas de detalle-ventas*/}
          <Route path="ventas/:ventaId/agregar-producto" element={<DetalleVentaCrear />} />
          <Route path="ventas/:ventaId/detalle_venta/:id/editar" element={<DetalleVentaEditar />} />

          {/* Rutas de perfil*/}
          <Route path="/perfil" element={<PerfilDetalle />} />

          {/* Rutas de about*/}
          <Route path="/about" element={<About />} />

        </Route>
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      
      {/* Container de notificaciones - fuera de las rutas para que esté disponible globalmente */}
      <NotificationContainer />
    </NotificationProvider>
  );
}

export default AppRoutes;