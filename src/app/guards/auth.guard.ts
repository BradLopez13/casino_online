import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { PerfilService } from '../services/perfil.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const perfiles = inject(PerfilService);

  return new Observable<boolean>(subscriber => {
    onAuthStateChanged(auth, user => {
      if (user) {
        perfiles.precargar();
        subscriber.next(true);
      } else {
        router.navigate(['/login']);
        subscriber.next(false);
      }
      subscriber.complete();
    });
  });
};
