export interface Persona {
  id: number;
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
}

export interface PersonasResponse {
  status: string;
  message: string;
  data: Persona[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}