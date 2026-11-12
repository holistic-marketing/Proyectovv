"use client";

import type { FormEvent } from "react";

type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isValidatable(target: EventTarget | null): target is ValidatableElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/** Mensaje en español para el estado de validación nativo del campo. */
function spanishMessage(el: ValidatableElement): string {
  const v = el.validity;
  if (v.valueMissing) {
    return el instanceof HTMLInputElement && el.type === "email"
      ? "Escribe tu correo electrónico."
      : "Completa este campo.";
  }
  if (v.typeMismatch) {
    if (el instanceof HTMLInputElement && el.type === "email") {
      return "Escribe un correo válido, por ejemplo nombre@ejemplo.com.";
    }
    return "El formato no es válido.";
  }
  if (v.patternMismatch) {
    if (el instanceof HTMLInputElement && el.inputMode === "numeric") {
      return el.maxLength > 0
        ? `Escribe solo números (hasta ${el.maxLength} dígitos).`
        : "Escribe solo números.";
    }
    return "El formato no es válido.";
  }
  if (v.tooShort && "minLength" in el) return `Escribe al menos ${el.minLength} caracteres.`;
  if (v.tooLong && "maxLength" in el) return `Escribe como máximo ${el.maxLength} caracteres.`;
  if (v.rangeUnderflow || v.rangeOverflow || v.stepMismatch) return "El valor no es válido.";
  if (v.badInput) return "El valor no es válido.";
  return "";
}

/**
 * Validación nativa del navegador en español (si no, sale en el idioma del navegador:
 * "Please fill out this field"). Úsalo en el <form>:
 *   onInvalidCapture={setSpanishValidityMessage} onInputCapture={clearValidityMessage}
 */
export function setSpanishValidityMessage(event: FormEvent<HTMLFormElement>): void {
  const target = event.target;
  if (!isValidatable(target)) return;
  target.setCustomValidity("");
  const message = spanishMessage(target);
  if (message) target.setCustomValidity(message);
}

/** Al escribir, se borra el mensaje propio para que el navegador vuelva a evaluar el campo. */
export function clearValidityMessage(event: FormEvent<HTMLFormElement>): void {
  const target = event.target;
  if (isValidatable(target)) target.setCustomValidity("");
}

/**
 * Props para el <form> según el idioma: en español se traducen los mensajes nativos;
 * en otros idiomas se deja el mensaje del navegador.
 */
export function spanishValidityFormProps(locale: string = "es") {
  if (locale !== "es") return {};
  return {
    onInvalidCapture: setSpanishValidityMessage,
    onInputCapture: clearValidityMessage,
  };
}
