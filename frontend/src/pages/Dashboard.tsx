import { StockBajoTable } from "../components/StockBajoTable";
import { useDashboardData } from "../hooks/useDashboardData";
import { HiOutlineCalendar } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { totalProductos, ventasMes, clientesConVentas, fecha } = useDashboardData();
  const navigate = useNavigate();

  return (
    <>
      <div className="p-4">
        {/* Encabezado */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl text-cl_font_main font-semibold">Resumen del negocio</h1>
            <p className="text-cl_font_sec mt-1">Datos estratégicos y notificaciones críticas de stock.</p>
          </div>
          <div className="flex items-center gap-2 text-cl_font_main text-lg font-semibold">
            <HiOutlineCalendar className="text-xl" />
            {fecha}
          </div>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-app p-4 border border-gray_lines">
            <h3 className="text-lg font-bold text-cl_font_main underline underline-offset-4">Productos</h3>
            <p className="text-2xl p-3 text-cl_font_main">{totalProductos}</p>
            <button
              onClick={() => navigate("/productos/crear")}
              className="block w-full bg-blue hover:bg-blue_hover text-white py-2 rounded mb-2"
            >
              Nuevo Producto
            </button>
          </div>
          <div className="bg-white rounded-app p-4 border border-gray_lines">
            <h3 className="text-lg font-bold text-cl_font_main underline underline-offset-4">Ventas Mensuales</h3>
            <p className="text-2xl p-3 text-cl_font_main">{ventasMes}</p>
            <button
              onClick={() => navigate("/ventas/crear")}
              className="block w-full bg-blue hover:bg-blue_hover text-white py-2 rounded mb-2"
            >
              Nueva Venta
            </button>
          </div>
          <div className="bg-white rounded-app p-4 border border-gray_lines">
            <h3 className="text-lg font-bold text-cl_font_main underline underline-offset-4">Clientes con ventas</h3>
            <p className="text-2xl p-3 text-cl_font_main">{clientesConVentas}</p>
            <button
              onClick={() => navigate("/clientes/crear")}
              className="block w-full bg-blue hover:bg-blue_hover text-white py-2 rounded mb-2"
            >
              Nuevo Cliente
            </button>
          </div>
          <div className="bg-white rounded-app p-4 border border-gray_lines">
            <h3 className="text-lg font-bold mb-2 text-cl_font_main underline underline-offset-4">Accesos rápidos</h3>
            <button
              onClick={() => navigate("/categorias/crear")}
              className="block w-full bg-blue hover:bg-blue_hover text-white py-2 rounded mb-2"
            >
              Nueva Categoría
            </button>
            <button
              onClick={() => navigate("/movimientos")}
              className="block w-full bg-blue hover:bg-blue_hover text-white py-2 rounded"
            >
              Historial
            </button>
          </div>
        </div>

        {/* Stock bajo */}
        <div className="bg-white rounded-app p-4 border border-gray_lines mt-6">
          <h3 className="text-lg font-bold mb-4 text-cl_font_main underline underline-offset-4">Stock Bajo</h3>
          <StockBajoTable />
        </div>
      </div>
    </>
  );
};

export default Dashboard;