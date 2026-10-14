"use client";

import { useEffect } from "react";
import { captureUtms } from "@/lib/tracking";

/** Guarda utm_* da URL de entrada na sessão; track() anexa em todos os eventos. */
export function UTMCapture() {
  useEffect(() => {
    captureUtms(window.location.search);
  }, []);
  return null;
}
