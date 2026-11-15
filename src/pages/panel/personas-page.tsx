import { FormEvent, useEffect, useState } from 'react';
import { Container } from '@/components/common/container';
import { personaService } from '@/services/persona.service';
import { Persona } from '@/types/persona';

export const PersonasPage = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargarPersonas = async (numeroPagina = 1) => {
    try {
      setCargando(true);
      setMensaje('');

      const resultado = await personaService.listarPersonas(
        numeroPagina,
        10,
      );

      setPersonas(resultado.data);
      setPagina(resultado.pagina);
      setTotalPaginas(resultado.totalPaginas);
      setTotal(resultado.total);
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las personas.',
      );
    } finally {
      setCargando(false);
    }
  };

  const buscarPersonas = async (
    numeroPagina = 1,
    nombreBusqueda = nombres,
    apellidoBusqueda = apellidos,
  ) => {
    const nombre = nombreBusqueda.trim();
    const apellido = apellidoBusqueda.trim();

    // Si no existen filtros, mostramos el listado normal
    if (!nombre && !apellido) {
      await cargarPersonas(numeroPagina);
      return;
    }

    try {
      setCargando(true);
      setMensaje('');

      const resultado = await personaService.buscarPersonas(
        nombre || undefined,
        apellido || undefined,
        numeroPagina,
        10,
      );

      setPersonas(resultado.data);
      setPagina(resultado.pagina);
      setTotalPaginas(resultado.totalPaginas);
      setTotal(resultado.total);

      if (resultado.data.length === 0) {
        setMensaje('No se encontraron personas.');
      }
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudo realizar la búsqueda.',
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPersonas(1);
  }, []);

  const manejarBusqueda = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    await buscarPersonas(1);
  };

  const limpiarBusqueda = async () => {
    setNombres('');
    setApellidos('');
    setMensaje('');

    await cargarPersonas(1);
  };

  const cambiarPagina = async (nuevaPagina: number) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) {
      return;
    }

    if (nombres.trim() || apellidos.trim()) {
      await buscarPersonas(nuevaPagina);
    } else {
      await cargarPersonas(nuevaPagina);
    }
  };

  return (
    <Container>
      <div className="space-y-6 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Personas
          </h1>

          <p className="text-sm text-muted-foreground">
            Administración y búsqueda de personas registradas.
          </p>
        </div>

        <form
          onSubmit={manejarBusqueda}
          className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-4"
        >
          <input
            type="text"
            value={nombres}
            onChange={(event) => setNombres(event.target.value)}
            placeholder="Buscar por nombres"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />

          <input
            type="text"
            value={apellidos}
            onChange={(event) => setApellidos(event.target.value)}
            placeholder="Buscar por apellidos"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />

          <button
            type="submit"
            disabled={cargando}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Buscar
          </button>

          <button
            type="button"
            onClick={limpiarBusqueda}
            disabled={cargando}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Limpiar
          </button>
        </form>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Total de personas: {total}
          </p>

          <p className="text-sm text-muted-foreground">
            Página {pagina} de {totalPaginas}
          </p>
        </div>

        {mensaje && (
          <div className="rounded-lg border border-border p-3 text-sm">
            {mensaje}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nombres</th>
                <th className="p-3 text-left">Apellidos</th>
                <th className="p-3 text-left">Documento</th>
                <th className="p-3 text-left">Teléfono</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">
                  Fecha nacimiento
                </th>
              </tr>
            </thead>

            <tbody>
              {personas.map((persona) => (
                <tr
                  key={persona.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="p-3">
                    {persona.id}
                  </td>

                  <td className="p-3">
                    {persona.nombres}
                  </td>

                  <td className="p-3">
                    {persona.apellidos}
                  </td>

                  <td className="p-3">
                    {persona.documento}
                  </td>

                  <td className="p-3">
                    {persona.telefono}
                  </td>

                  <td className="p-3">
                    {persona.email}
                  </td>

                  <td className="p-3">
                    {persona.fechaNacimiento}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!cargando && personas.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No hay personas para mostrar.
            </p>
          )}

          {cargando && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Cargando personas...
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => cambiarPagina(pagina - 1)}
            disabled={pagina <= 1 || cargando}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-sm">
            {pagina} / {totalPaginas}
          </span>

          <button
            type="button"
            onClick={() => cambiarPagina(pagina + 1)}
            disabled={pagina >= totalPaginas || cargando}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </Container>
  );
};