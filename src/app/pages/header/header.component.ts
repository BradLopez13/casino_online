import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
  OnChanges,
  SimpleChanges,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../ui/icon/icon.component';
import { LogoComponent } from '../../ui/logo/logo.component';
import { FichasPipe } from '../../ui/fichas.pipe';
import { IdiomaComponent } from '../../ui/idioma/idioma.component';
import { useI18n } from '../../i18n/i18n.service';

/** A partir de este ancho la cuenta se muestra como barra de navegación, sin desplegable. */
const CONSULTA_ESCRITORIO = '(width >= 74em)'; // = $bp-2xl en src/styles/_medidas.scss

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent, LogoComponent, FichasPipe, IdiomaComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnChanges {
  @Input() nombre: string = '';
  @Input() saldo: number = 1000;

  @Output() changeName = new EventEmitter<void>();
  @Output() changePassword = new EventEmitter<void>();
  @Output() addSaldo = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();

  menuAbierto = false;
  infoAbierta = false;
  /** Destello breve del saldo cuando cambia tras cargar. */
  pulso = false;

  @ViewChild('dropdownRef') dropdownRef!: ElementRef<HTMLElement>;
  @ViewChild('saldoRef') saldoRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('cerrarInfoRef') cerrarInfoRef?: ElementRef<HTMLButtonElement>;

  protected readonly i18n = useI18n();
  protected readonly t = this.i18n.t;

  /** Verdadero en pantallas anchas: la navegación queda visible y no hay menú desplegable. */
  readonly esEscritorio = signal(false);

  private pulsoTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const consulta = window.matchMedia(CONSULTA_ESCRITORIO);
    const actualizar = () => {
      this.esEscritorio.set(consulta.matches);
      if (consulta.matches) this.menuAbierto = false;
    };
    actualizar();
    consulta.addEventListener('change', actualizar);
    inject(DestroyRef).onDestroy(() => consulta.removeEventListener('change', actualizar));
  }

  get etiquetaMenu(): string {
    const nombre = this.nombre.trim();
    if (nombre) return this.t(this.menuAbierto ? 'header.cerrarMenuDe' : 'header.abrirMenuDe', { nombre });
    return this.t(this.menuAbierto ? 'header.cerrarMenu' : 'header.abrirMenu');
  }

  ngOnChanges(cambios: SimpleChanges) {
    const saldo = cambios['saldo'];
    if (!saldo || saldo.firstChange || saldo.previousValue === saldo.currentValue) return;
    this.pulso = false;
    clearTimeout(this.pulsoTimer);
    // Un frame sin la clase para que la animación se reinicie en cambios seguidos.
    requestAnimationFrame(() => {
      this.pulso = true;
      this.pulsoTimer = setTimeout(() => (this.pulso = false), 700);
    });
  }

  /**
   * Con <base href="/"> un href="#contenido" navegaría a /#contenido y sacaría
   * al jugador de la mesa. Se enfoca el contenido de la ruta actual sin navegar.
   */
  saltarAlContenido(event: Event) {
    const destino = document.getElementById('contenido');
    if (!destino) return;
    event.preventDefault();
    if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
    destino.focus();
    destino.scrollIntoView({ block: 'start' });
  }

  abrirInfo() {
    this.cerrar();
    this.infoAbierta = true;
    requestAnimationFrame(() => this.cerrarInfoRef?.nativeElement.focus());
  }

  cerrarInfo() {
    this.infoAbierta = false;
    requestAnimationFrame(() => this.saldoRef?.nativeElement.focus());
  }

  onInfoBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) this.cerrarInfo();
  }

  /** Inicial mostrada en el avatar tipográfico. */
  get inicial(): string {
    const limpio = this.nombre.trim();
    return limpio ? limpio.charAt(0).toUpperCase() : '·';
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
    if (this.menuAbierto) this.enfocarItem(0);
  }

  @HostListener('document:click', ['$event'])
  closeMenuOutside(event: MouseEvent) {
    if (
      this.menuAbierto &&
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(event.target as Node)
    ) {
      this.menuAbierto = false;
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape() {
    if (this.infoAbierta) {
      this.cerrarInfo();
      return;
    }
    if (!this.menuAbierto) return;
    this.menuAbierto = false;
    this.enfocarToggle();
  }

  /** Flecha abajo sobre el botón abre el menú y entra en el primer elemento. */
  onToggleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.menuAbierto) this.menuAbierto = true;
      this.enfocarItem(event.key === 'ArrowDown' ? 0 : -1);
    }
  }

  /** Navegación con flechas, Inicio y Fin dentro del menú. */
  onMenuKeydown(event: KeyboardEvent) {
    const items = this.items();
    if (!items.length) return;
    const actual = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(actual + 1) % items.length].focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[(actual - 1 + items.length) % items.length].focus();
        break;
      case 'Home':
        event.preventDefault();
        items[0].focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1].focus();
        break;
      case 'Tab':
        this.menuAbierto = false;
        break;
    }
  }

  onChangeName() {
    this.changeName.emit();
    this.cerrar();
  }

  onChangePassword() {
    this.changePassword.emit();
    this.cerrar();
  }

  onAddSaldo() {
    this.addSaldo.emit();
    this.cerrar();
  }

  onLogout() {
    this.logout.emit();
    this.cerrar();
  }

  onGoHome() {
    this.goHome.emit();
    this.cerrar();
  }

  private cerrar() {
    this.menuAbierto = false;
  }

  private items(): HTMLElement[] {
    const raiz = this.dropdownRef?.nativeElement;
    return raiz ? Array.from(raiz.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemradio"]')) : [];
  }

  private enfocarItem(indice: number) {
    // El menú se renderiza con *ngIf; se espera al siguiente frame.
    requestAnimationFrame(() => {
      const items = this.items();
      if (!items.length) return;
      items[indice < 0 ? items.length - 1 : indice].focus();
    });
  }

  private enfocarToggle() {
    this.dropdownRef?.nativeElement.querySelector<HTMLElement>('.account-toggle')?.focus();
  }
}
