# Meridiano · Salón de juego

Proyecto de fin de ciclo (TFG) de Desarrollo de Aplicaciones Web, curso 2024-2025. Un casino con fichas de juego, hecho con Angular y Firebase: cada jugador empieza con 1.000 fichas sin valor real, las recarga con un rasca y las apuesta en tres mesas. La interfaz está en español y en inglés.

[![CI](https://github.com/BradLopez13/casino_online/actions/workflows/ci.yml/badge.svg)](https://github.com/BradLopez13/casino_online/actions/workflows/ci.yml)

## Qué hace

- **Cuentas:** registro e inicio de sesión con email y contraseña o con Google, opción de «recordarme», recuperación de contraseña por email y cambio de nombre y de contraseña.
- **Verificación de edad:** los juegos no se abren hasta que el jugador confirma que es mayor de edad.
- **Blackjack:** baraja completa, el as vale 1 u 11 según convenga, y la banca pide carta hasta llegar a 17.
- **Ruleta:** rueda europea de 37 números, con pleno (paga 36 a 1), color, par o impar y mitades.
- **Tragaperras:** tres rodillos y cinco líneas de pago, de ×2 las cerezas a ×15 el siete.
- **Rasca y recarga:** un boleto gratuito para recuperar fichas desde cualquier pantalla. Se puede cerrar sin gastarlo.
- **Dos idiomas:** español e inglés, con cambio al vuelo y el idioma recordado entre visitas.
- El saldo de cada jugador se guarda en Firestore y se mantiene entre sesiones.

## Tecnologías

Angular 19 con componentes standalone y señales, TypeScript, SCSS, Firebase Authentication y Cloud Firestore mediante `@angular/fire`.

## Diseño responsive sin píxeles

Ninguna medida de la interfaz está en píxeles. El sistema vive en [`src/styles/_medidas.scss`](src/styles/_medidas.scss) y en los tokens de [`src/styles.scss`](src/styles.scss):

- Los tamaños van en `rem`, así que siguen el tamaño de letra y el zoom que el usuario tenga en su navegador.
- Los puntos de corte van en `em` con la sintaxis de rango (`width >= 48em`). Si alguien sube la letra del navegador, el diseño cambia antes de columna.
- La tipografía y el espaciado son escalas fluidas con `clamp()`: crecen de forma continua entre 20rem y 90rem de ancho, sin saltos entre dispositivos.
- El tapete del blackjack, la máquina, la rueda, el tablero de la ruleta y la lista de mesas usan consultas de contenedor. Se adaptan al ancho de su columna, no al de la pantalla, y sus medidas internas (cartas, símbolos, número de la rueda) van en unidades `cqi`.
- Los objetivos táctiles miden al menos `2.75rem` y las líneas finas usan un token `--hairline` que escala con el zoom.

## Idiomas

Los textos están en [`src/i18n/es.json`](src/i18n/es.json) y [`src/i18n/en.json`](src/i18n/en.json). Cada componente los obtiene con un hook:

```ts
protected readonly t = useT();
```

```html
<h1>{{ t('login.titulo') }}</h1>
<p>{{ t('home.abierta', { hora: horaApertura }) }}</p>
```

Las claves están tipadas a partir de `es.json`: una clave mal escrita, o una que falte en `en.json`, no compila. Las cifras de fichas se formatean según el idioma («1.000 fichas» / «1,000 chips»).

## Lo que aprendí haciéndolo

- Estructurar una aplicación Angular por páginas con componentes standalone y enrutado.
- Proteger rutas con guards: sin sesión se vuelve al login y sin verificación de edad, a la portada.
- Integrar Firebase Authentication con dos proveedores y controlar la persistencia de la sesión.
- Modelar los datos de cada jugador en Firestore y mantenerlos sincronizados con la interfaz.
- Pasar las reglas de un juego de cartas a código: el valor variable del as y el turno de la banca.
- Comunicar componentes con `@Input` y `@Output`, como los modales y el rasca que reutilizan todas las páginas.
- Montar un sistema de i18n propio con señales y tipos derivados del JSON, sin librerías externas.
- Diseñar con medidas relativas y consultas de contenedor en lugar de puntos de corte en píxeles.
- Cuidar la accesibilidad: foco gestionado en los diálogos, avisos para lectores de pantalla, navegación con teclado en el menú y contraste AA.

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
