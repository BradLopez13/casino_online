import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-age-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './age-verification.component.html',
  styleUrls: ['./age-verification.component.scss']
})
export class AgeVerificationComponent {
  @Output() accepted = new EventEmitter<boolean>();

  aceptar() {
    localStorage.setItem('mayor18', 'true');
    this.accepted.emit(true);
  }

  rechazar() {
    alert('Debes ser mayor de 18 años para usar esta plataforma.');
    window.location.href = 'https://google.com';
  }
}
