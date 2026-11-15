import { http } from "@/lib/http";
import {
  Asiento,
  Funcion,
  Sala,
  CrearReserva
} from "@/types/cartelera";

// llamada a la api de cartelera
export const carteleraService = {

  // trae las funciones de la pelicula
  async listarFunciones(idPelicula?: number): Promise<Funcion[]> {
    const { data } = await http.get<Funcion[]>('/cartelera/funciones', {
      params: { idPelicula }
    });

    return data;
  },

  // trae las salas del cine
  async listarSalas(): Promise<Sala[]> {
    const { data } = await http.get<Sala[]>('/cartelera/salas');
    return data;
  },

  // trae los asientos y su disponibilidad para una funcion
  async listarAsientosFuncion(idFuncion: number): Promise<Asiento[]> {
    const { data } = await http.get<Asiento[]>(
      `/cartelera/funciones/${idFuncion}/asientos`
    );

    return data;
  },

  // registra una reserva
  async crearReserva(reserva: CrearReserva) {
    const { data } = await http.post('/reservas', reserva);

    return data;
  },
};