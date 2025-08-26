import api from "./axiosInstance";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  nombre: string;
  email: string;
  contrasena: string;
}

export const loginRequest = async (data: LoginData) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerRequest = async (data: RegisterData) => {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};




