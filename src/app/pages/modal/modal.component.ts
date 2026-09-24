import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() acceptText = 'Aceptar';
  @Input() cancelText = 'Cancelar';
  @Input() isPrompt = false;
  @Input() isPasswordField = false;
  @Input() inputPlaceholder: string = '';
  @Input() errorMessage: string | null = null;

  @Output() accepted = new EventEmitter<string | boolean>();

  inputValue = '';
  inputType: 'text' | 'password' = 'password';

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
  }
}
