import { http } from "@/lib/http";

interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
  };
  timestamp: string;
}

export const authService = {
  async login(usuario: string, contrasena: string): Promise<string> {
    const { data } = await http.post<LoginResponse>("/auth/login", {
      usuario,
      contrasena,
    });

    return data.data.token;
  },
};