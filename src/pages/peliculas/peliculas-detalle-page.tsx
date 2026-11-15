import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Container } from '@/components/common/container';
import { carteleraService } from '@/services/cartelera.service';
import { peliculaService } from '@/services/pelicula.service';
import { Asiento, Funcion } from '@/types/cartelera';
import { Pelicula } from '@/types/pelicula';

export function PeliculasDellatePage() {
  const { id } = useParams<{ id: string }>();
  const idPelicula = Number(id);

  const navigate = useNavigate();

  const [pelicula, setPelicula] = useState<Pelicula | undefined>();
  const [funciones, setFunciones] = useState<Funcion[]>([]);

  const [funcionSeleccionada, setFuncionSeleccionada] =
    useState<Funcion | null>(null);

  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [asientosSeleccionados, setAsientosSeleccionados] =
    useState<Asiento[]>([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoAsientos, setCargandoAsientos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    setError(null);

    Promise.all([
      peliculaService.obtenerPelicula(idPelicula),
      carteleraService.listarFunciones(idPelicula),
    ])
      .then(([peliculaHallada, funcionesHalladas]) => {
        setPelicula(peliculaHallada);
        setFunciones(funcionesHalladas);
      })
      .catch((error: Error) => {
        setError(error.message);
      })
      .finally(() => {
        setCargando(false);
      });
  }, [idPelicula]);

  async function seleccionarFuncion(funcion: Funcion) {
    try {
      setCargandoAsientos(true);
      setError(null);

      const resultado =
        await carteleraService.listarAsientosFuncion(funcion.idFuncion);

      setFuncionSeleccionada(funcion);
      setAsientos(resultado);
      setAsientosSeleccionados([]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los asientos.',
      );
    } finally {
      setCargandoAsientos(false);
    }
  }

  function seleccionarAsiento(asiento: Asiento) {
    if (!asiento.disponible) {
      return;
    }

    const yaSeleccionado = asientosSeleccionados.some(
      (item) => item.idAsiento === asiento.idAsiento,
    );

    if (yaSeleccionado) {
      setAsientosSeleccionados((actuales) =>
        actuales.filter(
          (item) => item.idAsiento !== asiento.idAsiento,
        ),
      );
    } else {
      setAsientosSeleccionados((actuales) => [
        ...actuales,
        asiento,
      ]);
    }
  }

  function continuarReserva() {
    if (
      !pelicula ||
      !funcionSeleccionada ||
      asientosSeleccionados.length === 0
    ) {
      return;
    }

    const totalReserva =
      asientosSeleccionados.length *
      Number(funcionSeleccionada.precio);

    const reservaPendiente = {
      idPelicula: pelicula.id,
      pelicula: pelicula.titulo,
      idFuncion: funcionSeleccionada.idFuncion,
      sala: funcionSeleccionada.sala,
      horaInicio: funcionSeleccionada.horaInicio,
      precio: Number(funcionSeleccionada.precio),

      asientos: asientosSeleccionados.map((asiento) => ({
        idAsiento: asiento.idAsiento,
        asiento: asiento.asiento,
      })),

      total: totalReserva,
    };

    sessionStorage.setItem(
      'reservaPendiente',
      JSON.stringify(reservaPendiente),
    );

    const token = localStorage.getItem('token');

    if (token) {
      navigate('/cartelera');
    } else {
      navigate('/auth/signup?next=/cartelera');
    }
  }

  const total = funcionSeleccionada
    ? asientosSeleccionados.length *
      Number(funcionSeleccionada.precio)
    : 0;

  if (cargando) {
    return (
      <Container>
        <p className="py-8">
          Cargando película...
        </p>
      </Container>
    );
  }

  if (!pelicula) {
    return (
      <Container>
        <div className="py-8">
          <p>No se encontró esa película.</p>

          <Link
            to="/peliculas"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Volver al listado
          </Link>
        </div>
      </Container>
    );
  }

  const poster = pelicula.imagenes[0];

  return (
    <Container>
      <div className="py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted">
            {poster ? (
              <img
                src={peliculaService.urlImagen(poster)}
                alt={pelicula.titulo}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-mono">
                {pelicula.titulo}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Selecciona una función para continuar
              </p>
            </div>

            <p className="text-sm leading-relaxed text-secondary-foreground">
              {pelicula.sinopsis}
            </p>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-mono">
                Horarios
              </h2>

              {funciones.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No hay funciones programadas.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-3">
                  {funciones.map((funcion) => {
                    const seleccionada =
                      funcionSeleccionada?.idFuncion ===
                      funcion.idFuncion;

                    return (
                      <button
                        key={funcion.idFuncion}
                        type="button"
                        onClick={() =>
                          seleccionarFuncion(funcion)
                        }
                        disabled={cargandoAsientos}
                        className={`rounded-lg border px-4 py-3 text-left transition ${
                          seleccionada
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary'
                        } disabled:cursor-wait disabled:opacity-50`}
                      >
                        <p className="text-base font-medium text-mono">
                          Hora Inicio{' '}
                          {funcion.horaInicio.slice(0, 5)}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Precio Bs. {funcion.precio}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Sala {funcion.sala} -{' '}
                          {funcion.tipoSala}
                        </p>

                        <p className="mt-2 text-xs font-medium text-primary">
                          Elegir horario
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {cargandoAsientos && (
          <div className="mt-8 rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground">
              Cargando asientos...
            </p>
          </div>
        )}

        {funcionSeleccionada && !cargandoAsientos && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">
              Selecciona tus butacas
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {pelicula.titulo} — {funcionSeleccionada.sala} —{' '}
              {funcionSeleccionada.horaInicio.slice(0, 5)}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Precio por asiento: Bs.{' '}
              {funcionSeleccionada.precio}
            </p>

            {asientos.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                No hay asientos registrados para esta función.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-5 gap-3 sm:grid-cols-8 lg:grid-cols-10">
                {asientos.map((asiento) => {
                  const seleccionado =
                    asientosSeleccionados.some(
                      (item) =>
                        item.idAsiento ===
                        asiento.idAsiento,
                    );

                  return (
                    <button
                      key={asiento.idAsiento}
                      type="button"
                      disabled={!asiento.disponible}
                      onClick={() =>
                        seleccionarAsiento(asiento)
                      }
                      className={`rounded-lg border p-2 text-sm transition ${
                        seleccionado
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      } disabled:cursor-not-allowed disabled:opacity-30`}
                    >
                      {asiento.asiento}
                    </button>
                  );
                })}
              </div>
            )}

            {asientosSeleccionados.length > 0 && (
              <div className="mt-6 rounded-lg border border-border p-4">
                <p className="text-sm">
                  Asientos seleccionados:{' '}
                  <strong>
                    {asientosSeleccionados
                      .map(
                        (asiento) =>
                          asiento.asiento,
                      )
                      .join(', ')}
                  </strong>
                </p>

                <p className="mt-2 text-sm">
                  Cantidad:{' '}
                  {asientosSeleccionados.length}
                </p>

                <p className="mt-3 text-xl font-semibold">
                  Total: Bs. {total.toFixed(2)}
                </p>

                <button
                  type="button"
                  onClick={continuarReserva}
                  className="mt-4 w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
                >
                  Continuar con la reserva
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}