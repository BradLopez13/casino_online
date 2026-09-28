import { Component } from '@angular/core';
import { useI18n } from '../../i18n/i18n.service';

/** Selector ES / EN: dos botones conmutables con el nombre completo del idioma para lectores de pantalla. */
@Component({
  selector: 'app-idioma',
  standalone: true,
  template: `
    <div class="idioma" role="group" [attr.aria-label]="i18n.t('idioma.grupo')">
      @for (codigo of i18n.idiomas; track codigo) {
        <button
          type="button"
          class="opcion mono"
          [attr.lang]="codigo"
          [attr.aria-pressed]="i18n.idioma() === codigo"
          [attr.aria-label]="i18n.t(codigo === 'es' ? 'idioma.es' : 'idioma.en')"
          (click)="i18n.cambiar(codigo)">
          {{ codigo.toUpperCase() }}
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-flex; flex: none; }
    .idioma {
      display: inline-flex;
      padding: 0.125rem;
      border: var(--hairline) solid var(--line);
      border-radius: var(--radius-full);
      background: var(--surface);
    }
    .opcion {
      min-width: var(--touch);
      min-height: 2.5rem;
      padding: 0 0.6rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      letter-spacing: 0.12em;
      color: var(--ink-3);
      transition: color 0.2s var(--ease-out), background-color 0.2s var(--ease-out);
    }
    .opcion:hover { color: var(--ink); }
    .opcion[aria-pressed="true"] {
      background: var(--accent);
      color: var(--accent-ink);
      font-weight: 600;
    }
  `]
})
export class IdiomaComponent {
  protected readonly i18n = useI18n();
}
