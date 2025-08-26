import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-only-black.svg";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [nombre, setName] = useState("");
    const [email, setEmail] = useState("");
    const [contrasena, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (contrasena !== confirm) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            await signup(nombre, email, contrasena);
            navigate("/login", {
                state: { message: "Usuario registrado correctamente. Ahora puede iniciar sesión." },
            });
        } catch (error: any) {
            if (error.response?.status === 409) {
                setError(error.response.data.detail);
            } else if (error.response?.status === 422) {
                setError("Datos inválidos. Revisa los campos ingresados.");
            } else {
                setError("Error inesperado. Intente nuevamente.");
            }
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
                <h2 className="text-4xl font-bold text-black mb-6 text-center">Registrarse</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    {/* NOMBRE */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Nombre
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={nombre}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue"
                            required
                        />
                    </div>

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
                        <label htmlFor="password" className="block text-sm font-medium mb-1">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={contrasena}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue"
                            required
                        />
                    </div>

                    {/* CONFIRMAR CONTRASEÑA */}
                    <div>
                        <label htmlFor="confirm" className="block text-sm font-medium mb-1">
                            Confirmación
                        </label>
                        <input
                            id="confirm"
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue"
                            required
                        />
                    </div>

                    {/* LINK A REGISTRO */}
                    <div className="text-sm text-black">
                        ¿Tiene cuenta?{" "}
                        <span
                            onClick={() => navigate("/login")}
                            className="text-blue font-medium cursor-pointer hover:underline"
                        >
                            Inicie Sesión.
                        </span>
                    </div>

                    {/* BOTÓN REGISTRO */}
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

export default Register;
