import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type IconName =
  | 'home' | 'pencil' | 'key' | 'ticket' | 'sign-out' | 'chevron' | 'arrow'
  | 'eye' | 'eye-off' | 'google' | 'cards' | 'wheel' | 'reels' | 'close' | 'spark'
  | 'cherry' | 'lemon' | 'grape' | 'bell' | 'diamond' | 'seven' | 'blank';

/**
 * Iconos de trazo único, 24x24, grosor 1.5.
 * Decorativos por defecto (aria-hidden); si se pasa `label` se anuncian.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon' },
  template: `
    <svg
      viewBox="0 0 24 24"
      width="24" height="24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="label ? null : 'true'"
      [attr.role]="label ? 'img' : null"
      [attr.aria-label]="label || null"
      focusable="false">
      @switch (name) {
        @case ('home') {
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>
        }
        @case ('pencil') {
          <path d="M4 20h4l11-11a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m13.5 7.5 3 3"/>
        }
        @case ('key') {
          <circle cx="8" cy="15" r="4"/><path d="m11 12 9-9m-3 3 3 3m-5-1 2 2"/>
        }
        @case ('ticket') {
          <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M10 6v12" stroke-dasharray="2 2"/>
        }
        @case ('sign-out') {
          <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 8l-4 4 4 4M6 12h9"/>
        }
        @case ('chevron') {
          <path d="m6 9 6 6 6-6"/>
        }
        @case ('arrow') {
          <path d="M5 12h14m-6-6 6 6-6 6"/>
        }
        @case ('close') {
          <path d="m6 6 12 12M18 6 6 18"/>
        }
        @case ('eye') {
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>
        }
        @case ('eye-off') {
          <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M7.4 7.5C4.4 9.3 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.3-1M9.9 5.8A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4"/>
        }
        @case ('google') {
          <path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7z" fill="currentColor" stroke="none" opacity=".95"/>
          <path d="M12 21c2.5 0 4.6-.8 6.2-2.3l-3.1-2.4c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H3.7v2.5A9 9 0 0 0 12 21z" fill="currentColor" stroke="none" opacity=".75"/>
          <path d="M6.9 13.4a5.4 5.4 0 0 1 0-3.5V7.4H3.7a9 9 0 0 0 0 8.1z" fill="currentColor" stroke="none" opacity=".55"/>
          <path d="M12 6.6c1.4 0 2.6.5 3.5 1.4l2.7-2.7A9 9 0 0 0 3.7 7.4l3.2 2.5C7.6 7.7 9.6 6.6 12 6.6z" fill="currentColor" stroke="none" opacity=".85"/>
        }
        @case ('cards') {
          <rect x="7" y="4" width="11" height="15" rx="1.5" transform="rotate(8 12.5 11.5)"/><rect x="5" y="6" width="11" height="15" rx="1.5" transform="rotate(-8 10.5 13.5)"/><path d="M9.5 11.5c0-1 1.5-1.4 1.5 0 0 1-1.5 2-1.5 2s-1.5-1-1.5-2c0-1.4 1.5-1 1.5 0z" fill="currentColor" stroke="none"/>
        }
        @case ('wheel') {
          <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v6.5M12 14.5V21M3 12h6.5M14.5 12H21M5.6 5.6l4.6 4.6M13.8 13.8l4.6 4.6M18.4 5.6l-4.6 4.6M10.2 13.8l-4.6 4.6"/>
        }
        @case ('reels') {
          <rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M9 6v12M15 6v12M5.5 12h2M11 12h2M16.5 12h2"/>
        }
        @case ('spark') {
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"/>
        }
        @case ('cherry') {
          <circle cx="8.5" cy="15.5" r="4"/><circle cx="16" cy="16" r="3.5"/><path d="M8.5 11.5C9 8 11 5 15.5 4M16 12.5c-.5-3.5-1-6.5-.5-8.5"/>
        }
        @case ('lemon') {
          <path d="M6.2 17.8c-2.9-2.9-2.9-8.4.5-11.3 3-2.7 8.2-2.3 11 .5 2.9 2.9 2.9 8.4-.5 11.3-3 2.7-8.2 2.3-11-.5z"/><path d="M17.5 6.5 20 4M6.5 17.5 4 20"/>
        }
        @case ('grape') {
          <circle cx="9" cy="10" r="2.6"/><circle cx="15" cy="10" r="2.6"/><circle cx="12" cy="14.5" r="2.6"/><circle cx="9" cy="19" r="2.2"/><circle cx="15" cy="19" r="2.2"/><path d="M12 7.5V3.5m0 0c1.5 0 3 .8 3.5 2"/>
        }
        @case ('bell') {
          <path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2H4.5z"/><path d="M10 21a2 2 0 0 0 4 0M12 5V3"/>
        }
        @case ('diamond') {
          <path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M7 4l5 16M17 4l-5 16M7 4l5 5 5-5"/>
        }
        @case ('seven') {
          <path d="M6 5h12l-7 15"/><path d="M6 5v3"/>
        }
        @default {
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" opacity=".4"/>
        }
      }
    </svg>
  `,
  styles: [`
    :host { display: inline-flex; width: 1.25rem; height: 1.25rem; flex: none; }
    svg { width: 100%; height: 100%; }
  `]
})
export class IconComponent {
  @Input({ required: true }) name: IconName | string = 'blank';
  @Input() label = '';
}
