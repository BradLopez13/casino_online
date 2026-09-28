import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../ui/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() nombre: string = '';
  @Input() saldo: number = 1000;

  @Output() changeName = new EventEmitter<void>();
  @Output() changePassword = new EventEmitter<void>();
  @Output() addSaldo = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();

  menuAbierto = false;

  @ViewChild('dropdownRef') dropdownRef!: ElementRef<HTMLElement>;

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
    return raiz ? Array.from(raiz.querySelectorAll<HTMLElement>('[role="menuitem"]')) : [];
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
