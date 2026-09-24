import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const ANA = 'ana';
const LUIS = 'luis';

let env: RulesTestEnvironment;

// Firestore client authenticated as `uid`, with the email Firebase Auth would put in the token.
const db = (uid: string) =>
  env.authenticatedContext(uid, { email: `${uid}@example.com` }).firestore();

const perfilNuevo = (uid: string) => ({
  email: `${uid}@example.com`,
  saldo: 1000,
  mayorDeEdad: false,
  createdAt: serverTimestamp(),
});

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-casino',
    firestore: { rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8') },
  });
});

afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  // Ana ya tiene cuenta; Luis se registra en cada test que lo necesite.
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `usuarios/${ANA}`), {
      email: `${ANA}@example.com`,
      saldo: 1000,
      mayorDeEdad: false,
      createdAt: new Date(),
    });
  });
});

describe('lectura', () => {
  it('un usuario lee su propio documento', async () => {
    await assertSucceeds(getDoc(doc(db(ANA), `usuarios/${ANA}`)));
  });

  it('un usuario no lee el documento de otro', async () => {
    await assertFails(getDoc(doc(db(LUIS), `usuarios/${ANA}`)));
  });

  it('sin sesión no se lee nada', async () => {
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), `usuarios/${ANA}`)));
  });
});

describe('registro', () => {
  it('se crea el perfil con los valores iniciales', async () => {
    await assertSucceeds(setDoc(doc(db(LUIS), `usuarios/${LUIS}`), perfilNuevo(LUIS)));
  });

  it('no se crea el perfil de otro usuario', async () => {
    await assertFails(setDoc(doc(db(LUIS), `usuarios/otro`), perfilNuevo('otro')));
  });

  it('no se empieza con más saldo del inicial', async () => {
    await assertFails(
      setDoc(doc(db(LUIS), `usuarios/${LUIS}`), { ...perfilNuevo(LUIS), saldo: 1_000_000 }),
    );
  });

  it('no se empieza marcado como mayor de edad', async () => {
    await assertFails(
      setDoc(doc(db(LUIS), `usuarios/${LUIS}`), { ...perfilNuevo(LUIS), mayorDeEdad: true }),
    );
  });

  it('no se registra con el email de otra persona', async () => {
    await assertFails(
      setDoc(doc(db(LUIS), `usuarios/${LUIS}`), { ...perfilNuevo(LUIS), email: 'ana@example.com' }),
    );
  });

  it('la fecha de alta la pone el servidor', async () => {
    await assertFails(
      setDoc(doc(db(LUIS), `usuarios/${LUIS}`), { ...perfilNuevo(LUIS), createdAt: new Date(0) }),
    );
  });

  it('no se añaden campos que la app no usa', async () => {
    await assertFails(
      setDoc(doc(db(LUIS), `usuarios/${LUIS}`), { ...perfilNuevo(LUIS), rol: 'admin' }),
    );
  });
});

describe('uso normal de la app', () => {
  it('actualiza el saldo tras una apuesta o un premio', async () => {
    await assertSucceeds(updateDoc(doc(db(ANA), `usuarios/${ANA}`), { saldo: 1020 }));
  });

  it('cambia el nombre', async () => {
    await assertSucceeds(updateDoc(doc(db(ANA), `usuarios/${ANA}`), { nombre: 'Ana' }));
  });

  it('confirma la mayoría de edad', async () => {
    await assertSucceeds(
      setDoc(doc(db(ANA), `usuarios/${ANA}`), { mayorDeEdad: true }, { merge: true }),
    );
  });
});

describe('actualizaciones no permitidas', () => {
  it('no se modifica el documento de otro usuario', async () => {
    await assertFails(updateDoc(doc(db(LUIS), `usuarios/${ANA}`), { saldo: 0 }));
  });

  it('el saldo no puede ser negativo', async () => {
    await assertFails(updateDoc(doc(db(ANA), `usuarios/${ANA}`), { saldo: -1 }));
  });

  it('el saldo tiene que ser un número', async () => {
    await assertFails(updateDoc(doc(db(ANA), `usuarios/${ANA}`), { saldo: 'mucho' }));
  });

  it('la mayoría de edad no se puede retirar', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), `usuarios/${ANA}`), { mayorDeEdad: true });
    });
    await assertFails(updateDoc(doc(db(ANA), `usuarios/${ANA}`), { mayorDeEdad: false }));
  });

  it('el email no se cambia', async () => {
    await assertFails(updateDoc(doc(db(ANA), `usuarios/${ANA}`), { email: 'nuevo@example.com' }));
  });

  it('el nombre no puede estar vacío ni pasar de 40 caracteres', async () => {
    await assertFails(updateDoc(doc(db(ANA), `usuarios/${ANA}`), { nombre: '' }));
    await assertFails(updateDoc(doc(db(ANA), `usuarios/${ANA}`), { nombre: 'x'.repeat(41) }));
  });

  it('el documento no se borra desde el cliente', async () => {
    await assertFails(deleteDoc(doc(db(ANA), `usuarios/${ANA}`)));
  });

  it('no se escribe en ninguna otra colección', async () => {
    await assertFails(setDoc(doc(db(ANA), 'partidas/1'), { resultado: 'gana' }));
  });
});
