import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Observable<boolean>(subscriber => {
    onAuthStateChanged(auth, user => {
      if (user) {
        subscriber.next(true);
      } else {
        router.navigate(['/login']);
        subscriber.next(false);
      }
      subscriber.complete();
    });
  });
};
