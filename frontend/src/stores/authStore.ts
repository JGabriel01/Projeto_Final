import { create } from 'zustand';
import type { Usuario } from '../types';

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  isAutenticado: boolean;
  isAdmin: boolean;
  login: (usuario: Usuario, token: string) => void;
  logout: () => void;
  inicializarDoLocalStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  token: null,
  isAutenticado: false,
  isAdmin: false,
  login: (usuario, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    set({ usuario, token, isAutenticado: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    set({ usuario: null, token: null, isAutenticado: false, isAdmin: false });
  },
  inicializarDoLocalStorage: () => {
    const token = localStorage.getItem('token');
    const usuarioJson = localStorage.getItem('usuario');
    if (token && usuarioJson) {
      const usuario = JSON.parse(usuarioJson);
      set({ usuario, token, isAutenticado: true });
    }
  },
}));
