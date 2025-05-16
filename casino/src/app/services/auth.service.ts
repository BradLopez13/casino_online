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

import {
  Firestore,
  getDoc,
  doc,
  setDoc
} from '@angular/fire/firestore';
import { from, switchMap,of  } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(cred => {
        const userDoc = doc(this.firestore, `usuarios/${cred.user.uid}`);
        return setDoc(userDoc, {
          email: cred.user.email,
          saldo: 1000,
          fichas: 100,
          mayordeEdad:false,
          createdAt: new Date()
        });
      })
    );
  }

  loginWithGoogle() {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      switchMap(cred => {
        const userRef = doc(this.firestore, `usuarios/${cred.user.uid}`);
        return from(getDoc(userRef)).pipe(
          switchMap(snapshot => {
            if (!snapshot.exists()) {
              console.log('Creando documento en Firestore para:', cred.user.uid);
              return from(setDoc(userRef, {
                email: cred.user.email,
                saldo: 1000,
                fichas: 100,
                createdAt: new Date()
              }));
            } else {
              return from(Promise.resolve()); // no hace nada si ya existe
            }
          })
        );
      })
    );
  }

  setPersistence(remember: boolean) {
    const mode = remember ? browserLocalPersistence : browserSessionPersistence;
    return setPersistence(this.auth, mode);
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
}
