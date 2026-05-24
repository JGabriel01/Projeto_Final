import { Navigate } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

interface PrivateRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function PrivateRoute({ children, adminOnly = false }: PrivateRouteProps) {
  useEffect(() => {
    const inicializarDoLocalStorage = useAuthStore.getState().inicializarDoLocalStorage;
    inicializarDoLocalStorage();
  }, []);

  const isAutenticado = useAuthStore((state) => state.isAutenticado);

  if (!isAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
