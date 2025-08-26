import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePerfilClick = () => {
    navigate("/perfil");
  };

  return (
    <header className="flex justify-between items-center px-6 py-2 bg-white w-full border-b border-gray_lines">
      <h2 className="text-lg font-medium">
        <span className="text-cl_font_main">Bienvenido, </span>
        <span className="text-blue uppercase font-semibold">
          { user?.nombre ?? "Usuario" }
        </span>
      </h2>
      <button
        onClick={handlePerfilClick}
        className="bg-orange hover:bg-orange_hover px-4 py-1 rounded text-white"
      >
        {user?.role === "admin" ? "Admin" : "Usuario"}
      </button>
    </header>
  );
};

export default Navbar;

