import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../ui/icon/icon.component';
import { useT } from '../../i18n/i18n.service';

let contador = 0;

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements AfterViewInit {
  @Input() title = '';
  @Input() message = '';
  /** Vacío usa el texto traducido por defecto. */
  @Input() acceptText = '';
  @Input() cancelText = '';
  @Input() isPrompt = false;
  @Input() isPasswordField = false;
  @Input() inputPlaceholder: string = '';
  @Input() errorMessage: string | null = null;

  @Output() accepted = new EventEmitter<string | boolean>();

  @ViewChild('campo') campo?: ElementRef<HTMLInputElement>;
  @ViewChild('primario') primario?: ElementRef<HTMLButtonElement>;

  protected readonly t = useT();

  inputValue = '';
  inputType: 'text' | 'password' = 'password';

  /** Identificadores únicos por instancia para enlazar aria-* con sus elementos. */
  readonly ids = (() => {
    const base = `modal-${++contador}`;
    return { title: `${base}-title`, message: `${base}-message`, input: `${base}-input`, error: `${base}-error` };
  })();

  /** Al abrir, el foco pasa al campo (si lo hay) o al botón principal. */
  ngAfterViewInit() {
    requestAnimationFrame(() => (this.campo?.nativeElement ?? this.primario?.nativeElement)?.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.cancelar();
  }

  onBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) this.cancelar();
  }

  aceptar() {
    if (this.isPrompt) {
      this.accepted.emit(this.inputValue);
    } else {
      this.accepted.emit(true);
    }
  }

  cancelar() {
    this.accepted.emit(false);
  }

  togglePasswordVisibility() {
    this.inputType = this.inputType === 'password' ? 'text' : 'password';
    this.campo?.nativeElement.focus();
  }
}
