// src/routes.ts

/**
 * Rutas que no requieren autenticación
 */
export const publicRoutes = [
  '/', 
  '/pago',
  '/faq',
  '/equipo',
  '/formulario',             
  '/auth/login',
  '/auth/register',

]

/**
 * Rutas relacionadas con autenticación
 */
export const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/error',
]

/**
 * Prefijo de rutas API que usan autenticación
 */
export const apiAuthPrefix = '/api/auth'

/**
 * Rutas API públicas
 */
export const publicApiRoutes = []

/**
 * Ruta por defecto después de login
 */
export const DEFAULT_LOGIN_REDIRECT = '/admin/dashboard'
