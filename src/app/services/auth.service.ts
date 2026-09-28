import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { updatePassword } from '@angular/fire/auth';
import { PerfilService } from './perfil.service';

import { from, switchMap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth, private perfiles: PerfilService) {}

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(cred => from(this.perfiles.crear(cred.user.uid, cred.user.email)))
    );
  }

  loginWithGoogle() {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      switchMap(cred => from(this.perfiles.crearSiNoExiste(cred.user.uid, cred.user.email)))
    );
  }

  setPersistence(remember: boolean) {
    const mode = remember ? browserLocalPersistence : browserSessionPersistence;
    return setPersistence(this.auth, mode);
  }

  /** Envía el enlace de restablecimiento. Quien llama no debe revelar si el correo existe. */
  resetPassword(email: string) {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  logout() {
    return from(signOut(this.auth));
  }

  getAuthInstance() {
    return this.auth;
  }

  get currentUser() {
    return this.auth.currentUser;
  }

  setMayorDeEdad(uid: string) {
    return from(this.perfiles.actualizar(uid, { mayorDeEdad: true }));
  }
  changePassword(newPassword: string) {
    const user = this.auth.currentUser;
    if (user) {
      return from(updatePassword(user, newPassword));
    } else {
      return throwError(() => new Error('Usuario no autenticado'));
    }
  }
}
