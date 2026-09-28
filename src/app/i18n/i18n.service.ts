import { Injectable, effect, inject, signal } from '@angular/core';
import es from '../../i18n/es.json';
import enJson from '../../i18n/en.json';

export type Idioma = 'es' | 'en';

/** Rutas con punto hasta cada texto del diccionario: 'header.salon', 'slot.simbolos.cereza'… */
type Rutas<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Rutas<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Clave válida de traducción; es.json es la referencia, así que una errata no compila. */
export type Clave = Rutas<typeof es>;

export type Parametros = Record<string, string | number>;

// El inglés debe tener la misma forma que el español: si falta una clave, falla la compilación.
const en: typeof es = enJson;
const DICCIONARIOS: Record<Idioma, typeof es> = { es, en };
const LOCALES: Record<Idioma, string> = { es: 'es-ES', en: 'en-GB' };
const CLAVE_ALMACEN = 'meridiano.idioma';

function idiomaInicial(): Idioma {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACEN);
    if (guardado === 'es' || guardado === 'en') return guardado;
  } catch {
    // Almacenamiento bloqueado: se usa el idioma del navegador.
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly idioma = signal<Idioma>(idiomaInicial());
  readonly idiomas: readonly Idioma[] = ['es', 'en'];

  private readonly formatos: Record<Idioma, Intl.NumberFormat> = {
    // 'always' agrupa también los millares de cuatro cifras («1.000»), que es-ES deja sin punto.
    es: new Intl.NumberFormat(LOCALES.es, { maximumFractionDigits: 2, useGrouping: 'always' } as unknown as Intl.NumberFormatOptions),
    en: new Intl.NumberFormat(LOCALES.en, { maximumFractionDigits: 2 })
  };

  constructor() {
    effect(() => {
      const idioma = this.idioma();
      document.documentElement.lang = idioma;
      document.title = this.t('comun.tituloPagina');
      try {
        localStorage.setItem(CLAVE_ALMACEN, idioma);
      } catch {
        // Sin almacenamiento el idioma dura lo que la pestaña.
      }
    });
  }

  cambiar(idioma: Idioma) {
    this.idioma.set(idioma);
  }

  /** Locale BCP 47 del idioma activo, para fechas y números. */
  locale(): string {
    return LOCALES[this.idioma()];
  }

  /**
   * Texto de la clave en el idioma activo, con {{parametros}} sustituidos.
   * Lee la señal, así que las plantillas se actualizan al cambiar de idioma.
   */
  readonly t = (clave: Clave, parametros?: Parametros): string => {
    const texto = this.buscar(DICCIONARIOS[this.idioma()], clave) ?? this.buscar(es, clave) ?? clave;
    if (!parametros) return texto;
    return texto.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, nombre: string) => String(parametros[nombre] ?? ''));
  };

  /** 1000 → «1.000 fichas» / «1,000 chips». Con `unidad` a false solo la cifra. */
  readonly fichas = (valor: number | null | undefined, unidad = true): string => {
    const n = Number(valor ?? 0);
    const cifra = this.formatos[this.idioma()].format(n);
    if (!unidad) return cifra;
    return this.t(n === 1 ? 'fichas.una' : 'fichas.varias', { n: cifra });
  };

  private buscar(diccionario: unknown, clave: string): string | undefined {
    let nodo: unknown = diccionario;
    for (const parte of clave.split('.')) {
      if (nodo === null || typeof nodo !== 'object') return undefined;
      nodo = (nodo as Record<string, unknown>)[parte];
    }
    return typeof nodo === 'string' ? nodo : undefined;
  }
}

/**
 * Hook de traducción para componentes: `protected readonly t = useT();`
 * y en la plantilla `{{ t('header.salon') }}`. Debe llamarse en contexto de inyección.
 */
export function useT() {
  return inject(I18nService).t;
}

/** Acceso completo al idioma (cambiarlo, formatear fichas, locale). */
export function useI18n() {
  return inject(I18nService);
}
