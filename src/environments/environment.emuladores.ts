import { Entorno } from './entorno';

/*
 * Desarrollo local contra los emuladores de Firebase (npm run emuladores).
 * El proyecto "demo-" no existe en la nube: el SDK no puede tocar datos
 * reales aunque algo esté mal configurado. Las claves son de relleno.
 */
export const environment: Entorno = {
  production: false,
  firebase: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-casino.firebaseapp.com',
    projectId: 'demo-casino',
    appId: 'demo-app-id'
  },
  emuladores: { host: '127.0.0.1', auth: 9099, firestore: 8080 }
};
