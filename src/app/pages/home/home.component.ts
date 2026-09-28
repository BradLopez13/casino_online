import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { authState, User, updatePassword } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ModalComponent } from '../modal/modal.component';
import { AgeVerificationComponent } from '../age-verification/age-verification.component';
import { ScratchModalComponent } from '../scratch-modal/scratch-modal.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { LogoComponent } from '../../ui/logo/logo.component';
import { FichasPipe } from '../../ui/fichas.pipe';
import { Clave, useI18n } from '../../i18n/i18n.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    HeaderComponent,
    AgeVerificationComponent,
    ModalComponent,
    ScratchModalComponent,
    IconComponent,
    LogoComponent,
    FichasPipe
  ]
})
export class HomeComponent {
  protected readonly i18n = useI18n();
  protected readonly t = this.i18n.t;

  user: User | null = null;
  saldo = 0;
  nombre = '';
  mayorDeEdad = false;

  // Modals
  mostrarModalNombre = false;
  mostrarModalSaldo = false;
  mostrarModalPassword = false;

  errorNombre: Clave | null = null;
  errorSaldo: Clave | null = null;
  errorPassword: Clave | null = null;
  esCuentaGoogle = false;

  mostrarScratch = false;
  cantidadGanada = 0;
  rascado = false;


  readonly juegos: { nombre: Clave; descripcion: Clave; nota: Clave; icono: string; ruta: string }[] = [
    { nombre: 'juegos.slot.nombre', descripcion: 'juegos.slot.descripcion', nota: 'juegos.slot.nota', icono: 'reels', ruta: '/slot' },
    { nombre: 'juegos.ruleta.nombre', descripcion: 'juegos.ruleta.descripcion', nota: 'juegos.ruleta.nota', icono: 'wheel', ruta: '/ruleta' },
    { nombre: 'juegos.blackjack.nombre', descripcion: 'juegos.blackjack.descripcion', nota: 'juegos.blackjack.nota', icono: 'cards', ruta: '/blackjack' }
  ];

  /** Hora local en la que se abrió la sesión, para la línea de cabecera. */
  /** Año en curso para el pie, sin tener que tocarlo cada enero. */
  readonly anio = new Date().getFullYear();

  private readonly apertura = new Date();
  get horaApertura(): string {
    return new Intl.DateTimeFormat(this.i18n.locale(), { hour: '2-digit', minute: '2-digit' }).format(this.apertura);
  }

  private auth = inject(AuthService);
  private perfiles = inject(PerfilService);
  private router = inject(Router);

  constructor() {
    authState(this.auth.getAuthInstance()).subscribe(async user => {
      if (user) {
        this.user = user;
        this.esCuentaGoogle = user.providerData.some(p => p.providerId === 'google.com');
        const perfil = await this.perfiles.leer(user.uid);
        if (perfil) {
          this.nombre = perfil.nombre ?? '';
          this.saldo = perfil.saldo;
          this.mayorDeEdad = perfil.mayorDeEdad;
        }
      }
    });
  }

  get nombreVisual(): string {
    return this.nombre.trim() ? this.nombre : this.user ? `${this.t('comun.usuario')}.${this.user.uid.substring(0,6)}` : this.t('comun.usuario');
  }

  // Event handlers from header
  onChangeName() { this.errorNombre = null; this.mostrarModalNombre = true; }
  onChangePassword() { this.errorPassword = null; this.mostrarModalPassword = true; }
  onAddSaldo() {
    this.errorSaldo = null;
    this.mostrarScratch = true;
    this.cantidadGanada = this.generarPremio();
    this.rascado = true;
  }
  onLogout() { this.auth.logout().subscribe(() => this.router.navigate(['/login'])); }

  // Modals callbacks
  onNombreModal(res: boolean | string | File) {
    this.mostrarModalNombre = false;
    this.errorNombre = null;
    if (typeof res === 'string' && res.trim() && this.user) {
      const nuevo = res.trim();
      this.perfiles.actualizar(this.user.uid, { nombre: nuevo })
        .then(()=> this.nombre = nuevo)
        .catch(()=>{ this.errorNombre='errores.nombreGuardar'; this.mostrarModalNombre=true; });
    } else if (typeof res==='string') {
      this.errorNombre='errores.nombreVacio'; this.mostrarModalNombre=true;
    }
  }
  generarPremio(): number {
    const premios = [0, 0, 0, 2, 5, 10, 20]; 
    const index = Math.floor(Math.random() * premios.length);
    return premios[index];
  }


  onPasswordModal(res: boolean | string | File) {
    this.mostrarModalPassword = false;
    this.errorPassword = null;
    if (this.esCuentaGoogle) return;
    if (typeof res==='string' && res.length>=6 && this.user) {
      updatePassword(this.user, res)
        .catch(()=>{ this.errorPassword='errores.passwordGuardar'; this.mostrarModalPassword=true; });
    } else if (typeof res==='string') {
      this.errorPassword='errores.passwordCorta'; this.mostrarModalPassword=true;
    }
  }
  onCerrarScratch() {
    this.mostrarScratch = false;
    if (this.cantidadGanada > 0 && this.user) {
      const nuevoSaldo = this.saldo + this.cantidadGanada;
      this.perfiles.actualizar(this.user.uid, { saldo: nuevoSaldo })
        .then(() => this.saldo = nuevoSaldo)
        .catch(() => this.errorSaldo = 'errores.saldo');
    }
  }


  confirmarMayorDeEdad() { this.mayorDeEdad=true; if (this.user) this.auth.setMayorDeEdad(this.user.uid).subscribe(); }

  jugar(ruta: string) { this.router.navigate([ruta]); }
}