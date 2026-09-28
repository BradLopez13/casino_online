import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild, inject } from '@angular/core';
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
export class AgeVerificationComponent implements AfterViewInit {
  @Output() accepted = new EventEmitter<boolean>();
  mensajeRechazo = false;

  @ViewChild('primario') primario?: ElementRef<HTMLButtonElement>;

  private router = inject(Router);
  private authService = inject(AuthService);

  /** El diálogo es bloqueante: el foco entra directamente en la opción principal. */
  ngAfterViewInit() {
    requestAnimationFrame(() => this.primario?.nativeElement.focus());
  }

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
