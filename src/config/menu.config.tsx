import {
  CalendarDays,
  Clapperboard,
  Home,
  PlusCircle,
  Popcorn,
  Ticket,
  UserCog,
  Users,
} from 'lucide-react';

import { type MenuConfig } from './types';

/**
 * Menú principal de la aplicación de cine.
 */
export const MENU_SIDEBAR: MenuConfig = [
  {
    title: 'Inicio',
    icon: Home,
    path: '/',
  },

  { heading: 'Cartelera' },

  {
    title: 'Funciones',
    icon: CalendarDays,
    path: '/cartelera',
  },

  { heading: 'Ventas' },

  {
    title: 'Reservar',
    icon: Ticket,
    path: '/reservas/nueva',
    disabled: true,
  },
  {
    title: 'Mis reservas',
    icon: Popcorn,
    path: '/reservas',
    disabled: true,
  },

  { heading: 'Administración' },

  {
    title: 'Personas',
    icon: Users,
    path: '/panel/personas',
  },
  {
    title: 'Nueva película',
    icon: PlusCircle,
    path: '/panel/peliculas/nueva',
  },
  {
    title: 'Roles',
    icon: UserCog,
    path: '/roles',
    disabled: true,
  },

  { heading: 'Zona pública' },

  {
    title: 'Ver películas',
    icon: Clapperboard,
    path: '/peliculas',
  },
];

/**
 * Menú superior.
 */
export const MENU_MEGA: MenuConfig = [
  {
    title: 'Inicio',
    path: '/',
  },
  {
    title: 'Cartelera',
    path: '/cartelera',
  },
];

export const MENU_MEGA_MOBILE: MenuConfig = MENU_MEGA;