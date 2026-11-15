import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { Container } from '@/components/common/container';
import { carteleraService } from '@/services/cartelera.service';
import { Asiento, Funcion } from '@/types/cartelera';

interface ReservaPendiente {
  idPelicula: number;
  pelicula: string;
  idFuncion: number;
  sala: string;
  horaInicio: string;
  precio: number;
  asientos: {
    idAsiento: number;
    asiento: string;
  }[];
  total: number;
}

export const CarteleraPage = () => {
  const { user } = useAuth();

  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [funcionSeleccionada, setFuncionSeleccionada] =
    useState<Funcion | null>(null);

  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [asientosSeleccionados, setAsientosSeleccionados] =
    useState<Asiento[]>([]);

  const [guardandoReserva, setGuardandoReserva] = useState(false);
  const [mensajeReserva, setMensajeReserva] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarCartelera() {
      try {
        setCargando(true);
        setMensajeReserva('');

        const funcionesObtenidas =
          await carteleraService.listarFunciones();

        setFunciones(funcionesObtenidas);

        /*
         * Revisamos si el usuario llegó aquí después de
         * seleccionar una película y butacas en la zona pública.
         */
        const reservaGuardada =
          sessionStorage.getItem('reservaPendiente');

        if (!reservaGuardada) {
          return;
        }

        const reservaPendiente: ReservaPendiente =
          JSON.parse(reservaGuardada);

        const funcionPendiente = funcionesObtenidas.find(
          (funcion) =>
            funcion.idFuncion === reservaPendiente.idFuncion,
        );

        if (!funcionPendiente) {
          sessionStorage.removeItem('reservaPendiente');

          setMensajeReserva(
            'La función seleccionada ya no está disponible.',
          );

          return;
        }

        const asientosFuncion =
          await carteleraService.listarAsientosFuncion(
            funcionPendiente.idFuncion,
          );

        setFuncionSeleccionada(funcionPendiente);
        setAsientos(asientosFuncion);

        /*
         * Recuperamos solamente los asientos que continúan
         * disponibles.
         */
        const asientosPendientes = asientosFuncion.filter(
          (asiento) =>
            asiento.disponible &&
            reservaPendiente.asientos.some(
              (pendiente) =>
                pendiente.idAsiento === asiento.idAsiento,
            ),
        );

        setAsientosSeleccionados(asientosPendientes);

        if (asientosPendientes.length === 0) {
          setMensajeReserva(
            'Los asientos seleccionados ya no están disponibles. Selecciona otros.',
          );
        } else if (
          asientosPendientes.length !==
          reservaPendiente.asientos.length
        ) {
          setMensajeReserva(
            'Algunos de los asientos seleccionados ya no están disponibles.',
          );
        } else {
          setMensajeReserva(
            'Recuperamos tu selección. Revisa los datos y confirma tu reserva.',
          );
        }
      } catch (error) {
        setMensajeReserva(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar la cartelera.',
        );
      } finally {
        setCargando(false);
      }
    }

    cargarCartelera();
  }, []);

  const verAsientos = async (funcion: Funcion) => {
    try {
      setMensajeReserva('');

      const resultado =
        await carteleraService.listarAsientosFuncion(
          funcion.idFuncion,
        );

      setFuncionSeleccionada(funcion);
      setAsientos(resultado);
      setAsientosSeleccionados([]);
    } catch (error) {
      setMensajeReserva(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los asientos.',
      );
    }
  };

  const seleccionarAsiento = (asiento: Asiento) => {
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

    setMensajeReserva('');
  };

  const total = funcionSeleccionada
    ? asientosSeleccionados.length *
      Number(funcionSeleccionada.precio)
    : 0;

  const confirmarReserva = async () => {
    if (!funcionSeleccionada) {
      return;
    }

    if (!user) {
      setMensajeReserva('Debes iniciar sesión.');
      return;
    }

    if (asientosSeleccionados.length === 0) {
      setMensajeReserva('Selecciona al menos un asiento.');
      return;
    }

    try {
      setGuardandoReserva(true);
      setMensajeReserva('');

      const codigoReserva = `RES-${Date.now()}`;

      await carteleraService.crearReserva({
        idCliente: user.id,
        idFuncion: funcionSeleccionada.idFuncion,
        fechaReserva: new Date().toISOString(),
        codigoReserva,
        estado: 'CONFIRMADA',
        total,
        detalles: asientosSeleccionados.map((asiento) => ({
          idAsiento: asiento.idAsiento,
          precio: Number(funcionSeleccionada.precio),
        })),
      });

      /*
       * La reserva ya fue creada.
       * Eliminamos la reserva temporal.
       */
      sessionStorage.removeItem('reservaPendiente');

      setMensajeReserva(
        `Reserva registrada correctamente. Código: ${codigoReserva}`,
      );

      /*
       * Volvemos a consultar los asientos para que los
       * recién reservados aparezcan como no disponibles.
       */
      const asientosActualizados =
        await carteleraService.listarAsientosFuncion(
          funcionSeleccionada.idFuncion,
        );

      setAsientos(asientosActualizados);
      setAsientosSeleccionados([]);
    } catch (error) {
      setMensajeReserva(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la reserva.',
      );
    } finally {
      setGuardandoReserva(false);
    }
  };

  if (cargando) {
    return (
      <Container>
        <div className="py-6">
          <p className="text-sm text-muted-foreground">
            Cargando cartelera...
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Cartelera
          </h1>

          <p className="text-sm text-muted-foreground">
            Selecciona una función para reservar tus asientos.
          </p>
        </div>

        {mensajeReserva && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm">
              {mensajeReserva}
            </p>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {funciones.map((funcion) => {
            const seleccionada =
              funcionSeleccionada?.idFuncion ===
              funcion.idFuncion;

            return (
              <article
                key={funcion.idFuncion}
                className={`rounded-xl border bg-card p-5 ${
                  seleccionada
                    ? 'border-primary'
                    : 'border-border'
                }`}
              >
                <h2 className="font-medium text-mono">
                  {funcion.pelicula}
                </h2>

                <p className="mt-2 text-sm">
                  Sala: {funcion.sala}
                </p>

                <p className="mt-1 text-sm">
                  Fecha: {funcion.fecha}
                </p>

                <p className="mt-1 text-sm">
                  Hora: {funcion.horaInicio}
                </p>

                <p className="mt-3 text-lg font-semibold text-mono">
                  Bs. {funcion.precio}
                </p>

                <button
                  type="button"
                  onClick={() => verAsientos(funcion)}
                  className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Reservar
                </button>
              </article>
            );
          })}
        </div>

        {funcionSeleccionada && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">
              Seleccionar asientos
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {funcionSeleccionada.pelicula} —{' '}
              {funcionSeleccionada.sala}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Hora: {funcionSeleccionada.horaInicio}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Precio por asiento: Bs.{' '}
              {funcionSeleccionada.precio}
            </p>

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

            {asientos.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                No hay asientos registrados para esta función.
              </p>
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
                  onClick={confirmarReserva}
                  disabled={guardandoReserva}
                  className="mt-4 w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardandoReserva
                    ? 'Registrando...'
                    : 'Confirmar reserva'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};