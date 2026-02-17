// src/routes.ts

/**
 * Rutas que no requieren autenticación
 */
export const publicRoutes = [
  "/", 
  "/pago",
  "/faq",
  "/equipo",
  "/formulario",
  "/recurso",


  "/auth/login",
  "/auth/register",

  // ✅ recovery flow
  "/auth/reset",
  "/auth/new-password",
  "/auth/confirm",
  "/auth/callback",
]

/**
 * Rutas relacionadas con autenticación
 * (si estás logueado, NO deberías estar acá)
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
]

/**
 * Prefijo de rutas API que usan autenticación
 */
export const apiAuthPrefix = "/api/auth"

/**
 * Rutas API públicas
 */
export const publicApiRoutes: string[] = []

/**
 * Ruta por defecto después de login
 */
export const DEFAULT_LOGIN_REDIRECT = "/admin/dashboard"
