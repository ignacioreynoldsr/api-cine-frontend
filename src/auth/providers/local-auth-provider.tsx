import { PropsWithChildren, useCallback, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import { AuthContext, UserModel } from '@/auth/context/auth-context';
import { authService } from '@/services/auth.service';

interface JwtPayload {
  id: number;
  usuario: string;
  roles: string[];
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading] = useState(false);
  const [user, setUser] = useState<UserModel | undefined>();

  const login = useCallback(
    async (usuario: string, contrasena: string) => {
      const token = await authService.login(usuario, contrasena);

      localStorage.setItem('token', token);

      const payload = jwtDecode<JwtPayload>(token);

      setUser({
        id: payload.id,
        usuario: payload.usuario,
        roles: payload.roles,
      });
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(undefined);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading,
        isAuthenticated: user !== undefined,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}