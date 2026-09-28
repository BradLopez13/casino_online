import { DestroyRef, Injectable, inject, signal } from '@angular/core';

/**
 * Tamaño de pantalla como señal, para lo que el CSS no puede decidir
 * (por ejemplo, si un <details> nace abierto).
 * El corte coincide con $bp-xl de src/styles/_medidas.scss.
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  /** Verdadero con dos columnas de maquetación (64em o más). */
  readonly amplio = signal(false);

  constructor() {
    const consulta = window.matchMedia('(width >= 64em)');
    const actualizar = () => this.amplio.set(consulta.matches);
    actualizar();
    consulta.addEventListener('change', actualizar);
    inject(DestroyRef).onDestroy(() => consulta.removeEventListener('change', actualizar));
  }
}
