import { ApplicationConfig } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

/*
 * Firestore no se registra aquí: PerfilService lo descarga bajo demanda tras
 * iniciar sesión, para que no pese en la primera carga del login.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      const emuladores = environment.emuladores;
      if (emuladores) {
        connectAuthEmulator(auth, `http://${emuladores.host}:${emuladores.auth}`, { disableWarnings: true });
      }
      return auth;
    })
  ]
};
