"use client";

import { useEffect, useState } from "react";

/**
 * URL `blob:` para previsualizar un `File` local. Se crea al cambiar el archivo
 * y se libera (`revokeObjectURL`) al reemplazarlo o al desmontar.
 */
export function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      // Sincroniza un recurso que asigna el navegador (blob URL), no estado derivable:
      // crearlo y liberarlo necesita el ciclo de vida del efecto.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return url;
}
