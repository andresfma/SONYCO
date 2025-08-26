import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiBox, FiGrid, FiArchive, FiList, FiShoppingCart, FiUsers, FiLogOut, FiMenu, FiUser, FiHelpCircle } from "react-icons/fi";
import logo from "../../assets/logo-only-white.svg"
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Efecto para detectar el ancho de pantalla y colapsar automáticamente
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1000) {
        setIsCollapsed(true);
      }
    };

    // Ejecutar al montar el componente
    handleResize();

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', handleResize);

    // Limpiar listener al desmontar
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: "Inicio", icon: <FiHome className="text-lg" />, path: "/dashboard" },
    { name: "Productos", icon: <FiBox className="text-lg" />, path: "/productos" },
    { name: "Categorías", icon: <FiGrid className="text-lg" />, path: "/categorias" },
    { name: "Inventario", icon: <FiArchive className="text-lg" />, path: "/inventarios" },
    { name: "Movimientos", icon: <FiList className="text-lg" />, path: "/movimientos" },
    { name: "Ventas", icon: <FiShoppingCart className="text-lg" />, path: "/ventas" },
    { name: "Clientes", icon: <FiUsers className="text-lg" />, path: "/clientes" },
    { name: "Usuarios", icon: <FiUser className="text-lg" />, path: "/usuarios" },
  ];

  return (
    <aside
      className={`h-screen bg-blue text-white flex flex-col justify-between p-4 transition-all duration-300 flex-shrink-0 ${isCollapsed ? "w-16" : "w-60"
        }`}
    >
      <div>
        {/* Encabezado */}
        {isCollapsed ? (
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mb-4 p-2 rounded hover:bg-blue_hover transition-colors"
            >
              <FiMenu className="text-xl" />
            </button>
            <Link to="/dashboard" className="flex justify-center">
              <img src={logo} alt="Sonyco Logo" className="h-8 w-8 object-contain" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <img src={logo} alt="Sonyco Logo" className="h-8 w-8 object-contain" />
              <span className="text-2xl font-bold">{import.meta.env.VITE_APP_NAME || 'SONYCO'}</span>
            </Link>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded hover:bg-blue_hover transition-colors"
            >
              <FiMenu className="text-xl" />
            </button>
          </div>
        )}

        {/* Menú */}
        <nav className="flex flex-col gap-1">
          {menuItems
            .filter((item) => item.name !== "Usuarios" || user?.role === "admin")
            .map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"
                  } py-2 rounded hover:bg-blue_hover transition-colors`}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
        </nav>
      </div>

      {/* Contenedor para agrupar abajo */}
      <div className="flex flex-col gap-1">
        <button
          onClick={() => navigate(`/about`)}
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"
            } py-2 rounded hover:bg-blue_hover transition-colors`}
        >
          <FiHelpCircle className="text-lg" />
          {!isCollapsed && <span>Acerca de</span>}
        </button>
        <button
          onClick={logout}
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"
            } py-2 rounded hover:bg-blue_hover transition-colors`}
        >
          <FiLogOut className="text-lg" />
          {!isCollapsed && <span>Salir</span>}
        </button>
      </div>
    </aside>

  );
};

export default Sidebar;