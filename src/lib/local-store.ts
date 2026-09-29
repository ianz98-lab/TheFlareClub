"use client";

import { useSyncExternalStore } from "react";

/**
 * Persistencia local (favoritos, progreso) mientras no hay backend.
 * En Fase 2 estas mismas funciones leen/escriben en Supabase.
 * Implementado con useSyncExternalStore para evitar setState en efectos y
 * mantener SSR sin desajustes de hidratación.
 */

const EVENT = "tfc:store";
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function snapshot<T>(key: string, fallback: T): T {
  const raw = typeof window === "undefined" ? null : readRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {}
  }
  cache.set(key, { raw, value });
  return value;
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function writeLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function readLocal<T>(key: string, fallback: T): T {
  return snapshot(key, fallback);
}

export function useLocal<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => snapshot(key, fallback),
    () => fallback,
  );
}

export const KEYS = {
  favorites: "tfc:favorites",
  progress: "tfc:progress",
  courseProgress: "tfc:course-progress",
} as const;

export type ProgressMap = Record<string, { at: number; pct: number }>;
