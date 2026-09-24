import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-age-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './age-verification.component.html',
  styleUrls: ['./age-verification.component.scss']
})
export class AgeVerificationComponent {
  @Output() accepted = new EventEmitter<boolean>();
  mensajeRechazo = false;

  private router = inject(Router);
  private authService = inject(AuthService);


  aceptar() {
    this.accepted.emit(true);
  }

  rechazar() {
    this.mensajeRechazo = true;

    setTimeout(() => {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
    }, 2500); // Espera para mostrar el mensaje
  }
}
