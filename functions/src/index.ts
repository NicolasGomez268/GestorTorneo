import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp()
}

export { adminMvp } from './callables/admin-mvp.callable'
