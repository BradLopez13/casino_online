import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { PerfilService } from '../services/perfil.service';

// Los juegos solo se abren tras confirmar la mayoría de edad; si no, se vuelve
// a /home, que es donde se muestra la verificación.
export const mayorDeEdadGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const perfiles = inject(PerfilService);
  const router = inject(Router);

  return new Observable<boolean>(subscriber => {
    onAuthStateChanged(auth, async user => {
      let verificado = false;
      if (user) {
        try {
          verificado = (await perfiles.leer(user.uid))?.mayorDeEdad === true;
        } catch {
          // Sin perfil legible, se trata como no verificado.
        }
      }

      if (verificado) {
        subscriber.next(true);
      } else {
        router.navigate(['/home']);
        subscriber.next(false);
      }
      subscriber.complete();
    });
  });
};
