import { http } from "@/lib/http";
import { PersonasResponse } from "@/types/persona";

export const personaService = {

  // Listar todas las personas con paginación
  async listarPersonas(
    pagina = 1,
    porPagina = 10,
  ): Promise<PersonasResponse> {
    const { data } = await http.get<PersonasResponse>("/persona", {
      params: {
        pagina,
        porPagina,
      },
    });

    return data;
  },

  // Buscar personas por nombres y/o apellidos
  async buscarPersonas(
    nombres?: string,
    apellidos?: string,
    pagina = 1,
    porPagina = 10,
  ): Promise<PersonasResponse> {
    const { data } = await http.get<PersonasResponse>("/persona/buscar", {
      params: {
        nombres: nombres || undefined,
        apellidos: apellidos || undefined,
        pagina,
        porPagina,
      },
    });

    return data;
  },
};