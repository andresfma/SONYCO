import { createContext, useState, useEffect, useContext } from "react";
import { loginRequest, registerRequest, getCurrentUser } from "../api/auth";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// Interfaz de usuario (con rol traducido)
interface User {
  id: number;
  nombre: string;
  email: string;
  role: "admin" | "usuario"; //  rol mapeado
}

interface RawUser {
  id: number;
  nombre: string;
  email: string;
  rol_id: number; // tal como viene del backend
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const mapUser = (raw: RawUser): User => ({
    id: raw.id,
    nombre: raw.nombre,
    email: raw.email,
    role: raw.rol_id === 1 ? "admin" : "usuario",
  });

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const rawUser = await getCurrentUser();
        setIsAuthenticated(true);
        setUser(mapUser(rawUser));
      } catch (error) {
        console.error("Token inválido o expirado");
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginRequest({ email, password });
      const token = data.access_token;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);

      const rawUser = await getCurrentUser();
      setUser(mapUser(rawUser));

      navigate("/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Error desconocido";

      throw new Error(message);
    }
  };

  const signup = async (nombre: string, email: string, contrasena: string) => {
    await registerRequest({ nombre, email, contrasena });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
};
