import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';

/**
 * Formatea saldos y apuestas como fichas de juego, nunca como moneda,
 * en el idioma activo: 1000 → «1.000 fichas» / «1,000 chips».
 * Impuro para reaccionar al cambio de idioma; el coste es un formateo de número.
 */
@Pipe({ name: 'fichas', standalone: true, pure: false })
export class FichasPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(valor: number | null | undefined, unidad = true): string {
    return this.i18n.fichas(valor, unidad);
  }
}
