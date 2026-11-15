
export interface Funcion {
    idFuncion: number;
    idPelicula: number;
    pelicula: string;
    idSala: number;
    sala: string,
    tipoSala: string,
    fecha: string;
    horaInicio: string;
    horaFin: string;
    precio: number;
    estado: string;
}

// espera
export interface Sala {
    idSala: number;
    nombre: string;
    capacidad: number;
    tipo: string;
    activa: boolean;
}
 export interface Asiento {
  idAsiento: number;
  idSala: number;
  sala: string;
  fila: string;
  numero: number;
  asiento: string;
  tipo: string;
  activo: boolean;
  disponible?: boolean;
}
export interface DetalleReserva {
  idAsiento: number;
  precio: number;
}

export interface CrearReserva {
  idCliente: number;
  idFuncion: number;
  fechaReserva: string;
  codigoReserva: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  total: number;
  detalles: DetalleReserva[];
}