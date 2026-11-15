import { RouteObject } from 'react-router-dom';
import { BrandedLayout } from './layouts/branded';
import { SignInPage } from './pages/signin-page';
import { SignUpPage } from './pages/signup-page';

/**
 * Rutas públicas de autenticación.
 */
export const authRoutes: RouteObject[] = [
  {
    path: '',
    element: <BrandedLayout />,
    children: [
      {
        path: 'signin',
        element: <SignInPage />,
      },
      {
        path: 'signup',
        element: <SignUpPage />,
      },
    ],
  },
];