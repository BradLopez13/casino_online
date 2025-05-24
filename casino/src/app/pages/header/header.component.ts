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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
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

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  @HostListener('document:click', ['$event'])
  closeMenuOutside(event: MouseEvent) {
    if (
      this.menuAbierto &&
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(event.target)
    ) {
      this.menuAbierto = false;
    }
  }

  onChangeName() {
    this.changeName.emit();
    this.menuAbierto = false;
  }

  onChangePassword() {
    this.changePassword.emit();
    this.menuAbierto = false;
  }

  onAddSaldo() {
    this.addSaldo.emit();
    this.menuAbierto = false;
  }

  onLogout() {
    this.logout.emit();
    this.menuAbierto = false;
  }

  onGoHome() {
    this.goHome.emit();
    this.menuAbierto = false;
  }
}
