/** Forma común de los ficheros de entorno (el de producción y el de emuladores). */
export interface Entorno {
  production: boolean;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId: string;
    measurementId?: string;
  };
  /** Emuladores locales de Firebase; null usa el proyecto real. */
  emuladores: { host: string; auth: number; firestore: number } | null;
}
