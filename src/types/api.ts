export interface ApiResponse<T = unknown> {
  success: boolean;    // Indica si la operación fue exitosa (true/false)
  data?: T;            // Contiene los datos de la respuesta (solo si success es true)
  message?: string;    // Mensaje opcional informativo (ej: "Usuario creado con éxito")
  error?: string;      // Mensaje de error (solo si success es false)
}
