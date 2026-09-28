import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { LogoComponent } from './ui/logo/logo.component';
import { useT } from './i18n/i18n.service';

/** Forma del esqueleto según la mesa de destino. */
type Silueta = 'salon' | 'rueda' | 'tapete' | 'maquina' | 'acceso';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LogoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'casino';
  protected readonly t = useT();

  /** Verdadero mientras una navegación (guardas incluidas) tarda lo bastante como para notarse. */
  cargando = false;
  silueta: Silueta = 'salon';

  private readonly router = inject(Router);
  private retardo?: ReturnType<typeof setTimeout>;

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(evento => {
      if (evento instanceof NavigationStart) {
        this.silueta = this.siluetaDe(evento.url);
        clearTimeout(this.retardo);
        // Se espera un poco para no hacer parpadear el esqueleto en navegaciones instantáneas.
        this.retardo = setTimeout(() => (this.cargando = true), 120);
      } else if (
        evento instanceof NavigationEnd ||
        evento instanceof NavigationCancel ||
        evento instanceof NavigationError
      ) {
        clearTimeout(this.retardo);
        this.cargando = false;
      }
    });
  }

  private siluetaDe(url: string): Silueta {
    if (url.startsWith('/ruleta')) return 'rueda';
    if (url.startsWith('/blackjack')) return 'tapete';
    if (url.startsWith('/slot')) return 'maquina';
    if (url.startsWith('/login') || url.startsWith('/register')) return 'acceso';
    return 'salon';
  }
}
