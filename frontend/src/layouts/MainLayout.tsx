import { Outlet } from "react-router-dom";
import Sidebar from "../components/Generic/Sidebar";
import Navbar from "../components/Generic/Navbar";
import Footer from "../components/Generic/Footer";

const MainLayout = () => { 
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        {/* Contenedor scrollable que incluye el footer */}
        <main className="flex-1 overflow-auto">
          <div 
            className="min-h-full px-6 pt-6 pb-0 space-y-6 bg-gray_bg overflow-x-auto flex flex-col"
            style={{ minWidth: '1100px' }}
          >
            <div className="flex-1">
              <Outlet />
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;