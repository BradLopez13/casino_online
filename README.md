# Casino online

Proyecto de fin de ciclo (TFG) de Desarrollo de Aplicaciones Web, curso 2024-2025. Un casino con dinero de juego, hecho con Angular y Firebase: cada jugador empieza con 1.000 fichas, las recarga con un rasca y las apuesta en tres juegos.

[![CI](https://github.com/BradLopez13/casino_online/actions/workflows/ci.yml/badge.svg)](https://github.com/BradLopez13/casino_online/actions/workflows/ci.yml)

## Qué hace

- **Cuentas:** registro e inicio de sesión con email y contraseña o con Google, opción de «recordarme», y cambio de nombre y de contraseña.
- **Verificación de edad:** los juegos no se abren hasta que el jugador confirma que es mayor de edad.
- **Blackjack:** baraja completa, el as vale 1 u 11 según convenga, y la banca pide carta hasta llegar a 17.
- **Ruleta:** 37 números, con apuestas a número (paga 36 a 1), rojo o negro y par o impar.
- **Tragaperras:** seis símbolos, cada uno con su multiplicador, de ×2 las cerezas a ×15 el siete.
- **Rasca:** un premio aleatorio para recargar fichas desde cualquier pantalla.
- El saldo de cada jugador se guarda en Firestore y se mantiene entre sesiones.

## Tecnologías

Angular 19 con componentes standalone, TypeScript, SCSS, Firebase Authentication y Cloud Firestore mediante `@angular/fire`.

## Lo que aprendí haciéndolo

- Estructurar una aplicación Angular por páginas con componentes standalone y enrutado.
- Proteger rutas con guards: sin sesión se vuelve al login y sin verificación de edad, a la portada.
- Integrar Firebase Authentication con dos proveedores y controlar la persistencia de la sesión.
- Modelar los datos de cada jugador en Firestore y mantenerlos sincronizados con la interfaz.
- Pasar las reglas de un juego de cartas a código: el valor variable del as y el turno de la banca.
- Comunicar componentes con `@Input` y `@Output`, como los modales y el rasca que reutilizan todas las páginas.

## Seguridad de los datos

Las reglas de Firestore están en [`firestore.rules`](firestore.rules): cada jugador solo puede leer y modificar su propio documento, el perfil nace siempre con los mismos valores iniciales y la verificación de edad no se puede retirar. Se prueban con 21 tests contra el emulador de Firestore, en [`firestore-tests/`](firestore-tests/rules.test.ts).

## Cómo ejecutarlo

Requiere Node.js 22.

```bash
npm ci
npm start
```

La app queda en `http://localhost:4200`, conectada al proyecto de Firebase configurado en `src/environments/environment.ts`.

Con Docker, la misma app compilada para producción y servida con nginx:

```bash
docker compose up --build
```

Queda en `http://localhost:8080`.

Los tests de las reglas necesitan además Java 11 o superior para el emulador:

```bash
npm run test:rules
```
