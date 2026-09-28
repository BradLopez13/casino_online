// Crea un jugador de demostración en los emuladores locales de Firebase.
// Uso: con `npm run emuladores` en marcha, ejecutar `npm run sembrar`.
// Solo habla con 127.0.0.1 y con el proyecto "demo-casino"; no toca producción.

const HOST = '127.0.0.1';
const PROYECTO = 'demo-casino';

export const DEMO = {
  email: 'demo@meridiano.test',
  password: 'meridiano-demo',
  nombre: 'Jugador demo'
};

async function peticion(url, opciones) {
  const res = await fetch(url, opciones);
  const cuerpo = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${url}\n${JSON.stringify(cuerpo)}`);
  return cuerpo;
}

async function cuentaDemo() {
  const base = `http://${HOST}:9099/identitytoolkit.googleapis.com/v1`;
  const credenciales = JSON.stringify({ email: DEMO.email, password: DEMO.password, returnSecureToken: true });
  const cabeceras = { 'Content-Type': 'application/json' };
  try {
    return await peticion(`${base}/accounts:signUp?key=demo`, { method: 'POST', headers: cabeceras, body: credenciales });
  } catch {
    // Ya existía: se reutiliza.
    return peticion(`${base}/accounts:signInWithPassword?key=demo`, { method: 'POST', headers: cabeceras, body: credenciales });
  }
}

const { localId: uid } = await cuentaDemo();

// "Bearer owner" es el acceso de administrador del emulador: salta las reglas
// para dejar el perfil ya verificado como mayor de edad.
await peticion(
  `http://${HOST}:8080/v1/projects/${PROYECTO}/databases/(default)/documents/usuarios/${uid}`,
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({
      fields: {
        email: { stringValue: DEMO.email },
        nombre: { stringValue: DEMO.nombre },
        saldo: { integerValue: '1000' },
        mayorDeEdad: { booleanValue: true },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    })
  }
);

console.log(`Jugador demo listo: ${DEMO.email} (uid ${uid})`);
