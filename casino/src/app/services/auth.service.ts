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
  setPersistence
} from '@angular/fire/auth';
import { from, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth) {}

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  loginWithGoogle() {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider()));
  }

  setPersistence(remember: boolean) {
    const mode = remember ? browserLocalPersistence : browserSessionPersistence;
    return setPersistence(this.auth, mode);
  }

  logout() {
    return from(signOut(this.auth));
  }

  get currentUser() {
    return this.auth.currentUser;
  }
}
