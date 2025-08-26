import { useEffect, useState } from "react";
import {
  getTotalProductos,
  getVentasDelMes,
  getTotalClientesVentas
} from "../api/dashboard";

export const useDashboardData = () => {
  const [totalProductos, setTotalProductos] = useState(0);
  const [ventasMes, setVentasMes] = useState(0);
  const [clientesConVentas, setClientesConVentas] = useState(0);
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosRes, ventasRes, clienteRes] = await Promise.all([
          getTotalProductos(),
          getVentasDelMes(),
          getTotalClientesVentas()
        ]);

        setTotalProductos(productosRes.total);
        setVentasMes(ventasRes.total);
        setClientesConVentas(clienteRes.total);
        setFecha(new Date().toLocaleDateString());
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      }
    };

    fetchData();
  }, []);

  return { totalProductos, ventasMes, clientesConVentas, fecha };
};