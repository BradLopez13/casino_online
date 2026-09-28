import { Injectable, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import type { Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

/** Documento usuarios/{uid}. La forma la fijan las reglas de firestore.rules. */
export interface Perfil {
  email: string | null;
  nombre?: string;
  saldo: number;
  mayorDeEdad: boolean;
}

/** Campos que el jugador puede cambiar después del alta (ver regla update). */
export type CambiosPerfil = Partial<Pick<Perfil, 'saldo' | 'nombre' | 'mayorDeEdad'>>;

const SALDO_INICIAL = 1000;

/**
 * Único punto de acceso a Firestore.
 *
 * El SDK de Firestore es la dependencia más pesada de la app y no hace falta
 * para ver el login ni el registro. Se importa con import() la primera vez que
 * se necesita (tras iniciar sesión), así que queda fuera del bundle inicial.
 */
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly app = inject(FirebaseApp);
  private conexion?: Promise<{ sdk: typeof import('firebase/firestore'); db: Firestore }>;

  /** Descarga y conecta el SDK una sola vez; las llamadas siguientes reutilizan la promesa. */
  private conectar() {
    this.conexion ??= import('firebase/firestore').then(sdk => {
      const db = sdk.getFirestore(this.app);
      if (environment.emuladores) {
        sdk.connectFirestoreEmulator(db, environment.emuladores.host, environment.emuladores.firestore);
      }
      return { sdk, db };
    });
    return this.conexion;
  }

  /** Adelanta la descarga del SDK en cuanto hay sesión, para que la primera lectura sea inmediata. */
  precargar(): void {
    void this.conectar();
  }

  async leer(uid: string): Promise<Perfil | null> {
    const { sdk, db } = await this.conectar();
    const snap = await sdk.getDoc(sdk.doc(db, 'usuarios', uid));
    if (!snap.exists()) return null;
    const datos = snap.data();
    return {
      email: datos['email'] ?? null,
      nombre: datos['nombre'] || undefined,
      saldo: datos['saldo'] ?? 0,
      mayorDeEdad: datos['mayorDeEdad'] === true
    };
  }

  async actualizar(uid: string, cambios: CambiosPerfil): Promise<void> {
    const { sdk, db } = await this.conectar();
    await sdk.updateDoc(sdk.doc(db, 'usuarios', uid), cambios);
  }

  /** Alta del perfil con los valores iniciales que exigen las reglas. */
  async crear(uid: string, email: string | null): Promise<void> {
    const { sdk, db } = await this.conectar();
    await sdk.setDoc(sdk.doc(db, 'usuarios', uid), {
      email,
      saldo: SALDO_INICIAL,
      mayorDeEdad: false,
      createdAt: sdk.serverTimestamp()
    });
  }

  /** Para el acceso con Google: el perfil solo se crea la primera vez. */
  async crearSiNoExiste(uid: string, email: string | null): Promise<void> {
    if (await this.leer(uid)) return;
    await this.crear(uid, email);
  }
}
