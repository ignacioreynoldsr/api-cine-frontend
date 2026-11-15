import { FormEvent, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  Alert,
  AlertIcon,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinners';
import { http } from '@/lib/http';

export function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const [verContrasena, setVerContrasena] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get('next') || '/';

  async function registrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (
      !nombres.trim() ||
      !apellidos.trim() ||
      !documento.trim() ||
      !telefono.trim() ||
      !email.trim() ||
      !fechaNacimiento ||
      !usuario.trim() ||
      !contrasena
    ) {
      setError('Completa todos los campos.');
      return;
    }

    if (contrasena.length < 6) {
      setError(
        'La contraseña debe tener al menos 6 caracteres.',
      );
      return;
    }

    try {
      setProcesando(true);

      await http.post('/persona', {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        documento: documento.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        fechaNacimiento,
        usuario: usuario.trim(),

        // El backend utiliza "constrasena"
        constrasena: contrasena,

        // En cine.rol, el ID 11 corresponde a CLIENTE
        rol: 11,
      });

      navigate(
        `/auth/signin?next=${encodeURIComponent(next)}`,
        {
          replace: true,
        },
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo completar el registro.',
      );
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Crear cuenta
        </h1>

        <p className="text-sm text-muted-foreground">
          Regístrate para poder realizar tus reservas
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertIcon>
            <AlertCircle className="h-4 w-4" />
          </AlertIcon>

          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      <form
        onSubmit={registrar}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="nombres"
            >
              Nombres
            </label>

            <Input
              id="nombres"
              value={nombres}
              onChange={(event) =>
                setNombres(event.target.value)
              }
              placeholder="Ana María"
              disabled={procesando}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="apellidos"
            >
              Apellidos
            </label>

            <Input
              id="apellidos"
              value={apellidos}
              onChange={(event) =>
                setApellidos(event.target.value)
              }
              placeholder="Pérez López"
              disabled={procesando}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="documento"
            >
              Documento
            </label>

            <Input
              id="documento"
              value={documento}
              onChange={(event) =>
                setDocumento(event.target.value)
              }
              placeholder="12345678"
              disabled={procesando}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="telefono"
            >
              Teléfono
            </label>

            <Input
              id="telefono"
              value={telefono}
              onChange={(event) =>
                setTelefono(event.target.value)
              }
              placeholder="70123456"
              disabled={procesando}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="email"
          >
            Correo electrónico
          </label>

          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="correo@ejemplo.com"
            disabled={procesando}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="fechaNacimiento"
          >
            Fecha de nacimiento
          </label>

          <Input
            id="fechaNacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={(event) =>
              setFechaNacimiento(event.target.value)
            }
            disabled={procesando}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="usuario"
          >
            Usuario
          </label>

          <Input
            id="usuario"
            value={usuario}
            onChange={(event) =>
              setUsuario(event.target.value)
            }
            placeholder="ana.perez"
            autoComplete="username"
            disabled={procesando}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="contrasena"
          >
            Contraseña
          </label>

          <div className="relative">
            <Input
              id="contrasena"
              type={
                verContrasena
                  ? 'text'
                  : 'password'
              }
              value={contrasena}
              onChange={(event) =>
                setContrasena(event.target.value)
              }
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              disabled={procesando}
            />

            <button
              type="button"
              onClick={() =>
                setVerContrasena(
                  (valor) => !valor,
                )
              }
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={
                verContrasena
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
            >
              {verContrasena ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={procesando}
        >
          {procesando && (
            <Spinner className="me-2 h-4 w-4 animate-spin" />
          )}

          {procesando
            ? 'Registrando…'
            : 'Crear cuenta'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{' '}

        <Link
          to={`/auth/signin?next=${encodeURIComponent(next)}`}
          className="font-medium text-primary hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}