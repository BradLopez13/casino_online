import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Símbolo de Meridiano: ficha de juego, brújula de cuatro puntas y M en negativo.
 * Es decorativo; quien lo use pone el nombre accesible en su contenedor.
 * El tamaño lo fija el host (ancho y alto); el disco interior toma `--logo-bg`.
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'logo' },
  template: `
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle class="hilo" cx="32" cy="32" r="28.5"/>
      <circle class="canto" cx="32" cy="32" r="22.5"/>
      <circle class="disco" cx="32" cy="32" r="19.5"/>
      <path class="oro" d="M32 1 34.4 10.5 32 13 29.6 10.5Z M32 63 34.4 53.5 32 51 29.6 53.5Z M1 32 10.5 29.6 13 32 10.5 34.4Z M63 32 53.5 29.6 51 32 53.5 34.4Z"/>
      <path class="marfil" d="M20.5 44V23.5h4.4L32 33.6l7.1-10.1h4.4V44h-3.9V30.4L32 41.2l-7.6-10.8V44Z M18.5 44h7.8v1.4h-7.8Z M37.7 44h7.8v1.4h-7.8Z"/>
      <path class="oro" d="M32 16.2 33 20.4 37.2 21.4 33 22.4 32 26.6 31 22.4 26.8 21.4 31 20.4Z"/>
    </svg>
  `,
  styles: [`
    :host { display: inline-block; width: 2.5rem; height: 2.5rem; flex: none; }
    svg { width: 100%; height: 100%; overflow: visible; }
    .hilo { fill: none; stroke: var(--accent); stroke-width: 0.8; opacity: 0.55; }
    /* Canto de la ficha: ocho segmentos, con los cortes lejos de los puntos cardinales */
    .canto { fill: none; stroke: var(--accent); stroke-width: 5; stroke-dasharray: 12.6 5.07; stroke-dashoffset: 2.5; }
    .disco { fill: var(--logo-bg, var(--bg)); stroke: var(--accent); stroke-width: 0.6; }
    .oro { fill: var(--accent); }
    .marfil { fill: var(--ink); }
  `]
})
export class LogoComponent {}
