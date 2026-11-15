import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router';

import { Container } from '@/components/common/container';
import { peliculaService } from '@/services/pelicula.service';

export const PeliculasNuevaPage = () => {
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [sinopsis, setSinopsis] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState('');
  const [fechaEstreno, setFechaEstreno] = useState('');
  const [activo, setActivo] = useState(true);

  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previsualizaciones, setPrevisualizaciones] =
    useState<string[]>([]);

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const MAX_IMAGENES = 5;
  const MAX_TAMANO = 5 * 1024 * 1024;

  const tiposPermitidos = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  // Crear las previsualizaciones de las imágenes
  useEffect(() => {
    const urls = imagenes.map((imagen) =>
      URL.createObjectURL(imagen),
    );

    setPrevisualizaciones(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagenes]);

  const seleccionarImagenes = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setMensaje('');

    const archivos = Array.from(
      event.target.files ?? [],
    );

    if (archivos.length > MAX_IMAGENES) {
      setMensaje(
        'Solo puedes seleccionar hasta 5 imágenes.',
      );

      event.target.value = '';
      return;
    }

    const archivoInvalido = archivos.find(
      (archivo) =>
        !tiposPermitidos.includes(archivo.type),
    );

    if (archivoInvalido) {
      setMensaje(
        'Solo se permiten imágenes JPG, JPEG, PNG o WEBP.',
      );

      event.target.value = '';
      return;
    }

    const archivoMuyGrande = archivos.find(
      (archivo) => archivo.size > MAX_TAMANO,
    );

    if (archivoMuyGrande) {
      setMensaje(
        'Cada imagen debe pesar como máximo 5 MiB.',
      );

      event.target.value = '';
      return;
    }

    setImagenes(archivos);
  };

  const eliminarImagen = (indice: number) => {
    setImagenes((actuales) =>
      actuales.filter(
        (_, index) => index !== indice,
      ),
    );
  };

  const registrarPelicula = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setMensaje('');

    const tituloLimpio = titulo.trim();
    const sinopsisLimpia = sinopsis.trim();
    const duracion = Number(duracionMinutos);

    if (!tituloLimpio) {
      setMensaje('El título es obligatorio.');
      return;
    }

    if (!sinopsisLimpia) {
      setMensaje('La sinopsis es obligatoria.');
      return;
    }

    if (
      !Number.isInteger(duracion) ||
      duracion <= 0
    ) {
      setMensaje(
        'La duración debe ser un número entero mayor a 0.',
      );

      return;
    }

    if (!fechaEstreno) {
      setMensaje(
        'La fecha de estreno es obligatoria.',
      );

      return;
    }

    try {
      setCargando(true);

      const formData = new FormData();

      formData.append(
        'titulo',
        tituloLimpio,
      );

      formData.append(
        'sinopsis',
        sinopsisLimpia,
      );

      formData.append(
        'duracionMinutos',
        duracion.toString(),
      );

      formData.append(
        'fechaEstreno',
        fechaEstreno,
      );

      formData.append(
        'activo',
        activo.toString(),
      );

      imagenes.forEach((imagen) => {
        formData.append(
          'imagenes',
          imagen,
        );
      });

      await peliculaService.crearPelicula(
        formData,
      );

      navigate('/peliculas');
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la película.',
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container>
      <div className="space-y-6 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Registrar película
          </h1>

          <p className="text-sm text-muted-foreground">
            Registra una nueva película y agrega sus imágenes.
          </p>
        </div>

        {mensaje && (
          <div className="rounded-lg border border-border p-3 text-sm">
            {mensaje}
          </div>
        )}

        <form
          onSubmit={registrarPelicula}
          className="space-y-6 rounded-xl border border-border bg-card p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="titulo"
                className="text-sm font-medium"
              >
                Título
              </label>

              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(event) =>
                  setTitulo(event.target.value)
                }
                placeholder="Ej. Interestelar"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="duracion"
                className="text-sm font-medium"
              >
                Duración en minutos
              </label>

              <input
                id="duracion"
                type="number"
                min="1"
                value={duracionMinutos}
                onChange={(event) =>
                  setDuracionMinutos(
                    event.target.value,
                  )
                }
                placeholder="120"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="fechaEstreno"
                className="text-sm font-medium"
              >
                Fecha de estreno
              </label>

              <input
                id="fechaEstreno"
                type="date"
                value={fechaEstreno}
                onChange={(event) =>
                  setFechaEstreno(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="activo"
                className="text-sm font-medium"
              >
                Estado
              </label>

              <select
                id="activo"
                value={
                  activo ? 'true' : 'false'
                }
                onChange={(event) =>
                  setActivo(
                    event.target.value ===
                      'true',
                  )
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="true">
                  Activa
                </option>

                <option value="false">
                  Inactiva
                </option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="sinopsis"
              className="text-sm font-medium"
            >
              Sinopsis
            </label>

            <textarea
              id="sinopsis"
              value={sinopsis}
              onChange={(event) =>
                setSinopsis(
                  event.target.value,
                )
              }
              placeholder="Escribe la sinopsis de la película"
              rows={5}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="imagenes"
                className="text-sm font-medium"
              >
                Imágenes
              </label>

              <p className="text-xs text-muted-foreground">
                Hasta 5 imágenes JPG, JPEG,
                PNG o WEBP. Máximo 5 MiB por
                imagen.
              </p>
            </div>

            <input
              id="imagenes"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp"
              onChange={seleccionarImagenes}
              className="block w-full rounded-lg border border-border bg-background p-2 text-sm"
            />

            <p className="text-sm text-muted-foreground">
              Imágenes seleccionadas:{' '}
              {imagenes.length} / 5
            </p>

            {previsualizaciones.length >
              0 && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {previsualizaciones.map(
                  (url, indice) => (
                    <div
                      key={url}
                      className="overflow-hidden rounded-xl border border-border"
                    >
                      <img
                        src={url}
                        alt={`Previsualización ${
                          indice + 1
                        }`}
                        className="h-40 w-full object-cover"
                      />

                      <div className="p-2">
                        <p className="truncate text-xs text-muted-foreground">
                          {
                            imagenes[
                              indice
                            ]?.name
                          }
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarImagen(
                              indice,
                            )
                          }
                          className="mt-2 w-full rounded-lg border border-border px-2 py-1 text-xs"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                navigate('/peliculas')
              }
              disabled={cargando}
              className="rounded-lg border border-border px-5 py-2 text-sm font-medium disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={cargando}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cargando
                ? 'Registrando...'
                : 'Registrar película'}
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
};