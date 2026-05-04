import { HttpsError } from 'firebase-functions/v2/https'

import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../errores'

export const mapDominioAHttps = (error: unknown): never => {
  if (error instanceof HttpsError) {
    throw error
  }
  if (error instanceof ValidationError) {
    throw new HttpsError('invalid-argument', error.message, error.details)
  }
  if (error instanceof NotFoundError) {
    throw new HttpsError('not-found', error.message)
  }
  if (error instanceof ConflictError) {
    throw new HttpsError('already-exists', error.message)
  }
  if (error instanceof UnauthorizedError) {
    throw new HttpsError('permission-denied', error.message)
  }
  const msg = error instanceof Error ? error.message : 'Error interno'
  throw new HttpsError('internal', msg)
}
