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
  @Input() isImageUpload = false;
  @Input() inputPlaceholder: string = ''; // <- AÑADIDO AQUÍ
  @Input() errorMessage: string | null = null;

  @Output() accepted = new EventEmitter<string | boolean | File>();

  inputValue = '';
  selectedFile: File | null = null;

  aceptar() {
    if (this.isImageUpload && this.selectedFile) {
      this.accepted.emit(this.selectedFile);
    } else if (this.isPrompt) {
      this.accepted.emit(this.inputValue);
    } else {
      this.accepted.emit(true);
    }
  }

  cancelar() {
    this.accepted.emit(false);
  }
  onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
  } else {
    this.selectedFile = null;
  }
}

}
