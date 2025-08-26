import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo-only-black.svg";


const Login = () => {
  const location = useLocation();
  const successMessage = location.state?.message || "";

  const { login } = useAuth();
  const navigate = useNavigate();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 
        err.message || 
        "Error desconocido";

      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue_hover px-4">
      <div className="bg-white shadow-xl w-full max-w-md p-8">
        {/* LOGO */}
        <div className="flex items-center gap-2 mb-4">
          <img src={logo} alt="Sonyco Logo" className="h-8 w-8 object-contain" />
          <span className="text-2xl font-bold">{import.meta.env.VITE_APP_NAME || 'SONYCO'}</span>
        </div>

        {/* TÍTULO */}
        <h2 className="text-4xl font-bold text-black mb-6 text-center">Iniciar Sesión</h2>

        {successMessage && (
          <div className="text-green-600 text-sm text-center mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {/* EMAIL */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue"
              required
            />
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue"
              required
            />
          </div>

          {/* LINK A REGISTRO */}
          <div className="text-sm text-black">
            ¿No tiene cuenta?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue font-medium cursor-pointer hover:underline"
            >
              Cree una.
            </span>
          </div>

          {/* BOTÓN LOGIN */}
          <button
            type="submit"
            className="w-full border-2 border-orange bg-orange hover:bg-orange_hover hover:border-orange_hover text-white font-bold py-2 transition-colors"
          >
            Siguiente
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
