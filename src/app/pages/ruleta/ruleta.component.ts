import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ModalComponent } from '../modal/modal.component';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { ViewportService } from '../../ui/viewport.service';
import { Router } from '@angular/router';
import { authState, User, updatePassword } from '@angular/fire/auth';
import { ScratchModalComponent } from '../scratch-modal/scratch-modal.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { FichasPipe } from '../../ui/fichas.pipe';
import { Clave, useI18n } from '../../i18n/i18n.service';


@Component({
  selector: 'app-ruleta',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ModalComponent, ScratchModalComponent, IconComponent, FichasPipe],
  templateUrl: './ruleta.component.html',
  styleUrls: ['./ruleta.component.scss']
})
export class RuletaComponent {
  protected readonly i18n = useI18n();
  protected readonly t = this.i18n.t;
  /** Reglas abiertas de serie solo con dos columnas. */
  protected readonly vp = inject(ViewportService);

  private auth = inject(AuthService);
  private perfiles = inject(PerfilService);
  private router = inject(Router);

  nombre = '';
  saldo = 1000;
  user: User | null = null;

  apuestaActual = 0;
  apuestas: { tipo: string; cantidad: number }[] = [];
  resultado: number | null = null;
  resultadoMensaje: { ganancia: number } | null = null;
  enJuego = false;
  /** La ficha más baja viene elegida: el tablero se puede usar desde el primer momento. */
  fichaSeleccionada: number | null = 1;

  numeros = Array.from({ length: 37 }, (_, i) => i);
  fichas = [1, 5, 10, 25, 50, 100];
  rojos = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

  /** Apuestas exteriores, en el orden en que se pintan bajo la mesa. */
  readonly especiales: { tipo: string; etiqueta: Clave; clase: string }[] = [
    { tipo: '1-18', etiqueta: 'ruleta.exterior.bajo', clase: 'low' },
    { tipo: 'par', etiqueta: 'ruleta.exterior.par', clase: 'even' },
    { tipo: 'rojo', etiqueta: 'ruleta.exterior.rojo', clase: 'rojo' },
    { tipo: 'negro', etiqueta: 'ruleta.exterior.negro', clase: 'negro' },
    { tipo: 'impar', etiqueta: 'ruleta.exterior.impar', clase: 'odd' },
    { tipo: '19-36', etiqueta: 'ruleta.exterior.alto', clase: 'high' }
  ];

  /** Orden real de los números en una rueda europea, en el sentido de las agujas del reloj. */
  private readonly ordenRueda = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

  /** Gradiente cónico con los 37 sectores de la rueda, calculado una sola vez. */
  readonly gradienteRueda = (() => {
    const paso = 360 / 37;
    // El negro se aclara un poco: sobre el fondo carbón, #1b1d1c no se distinguía
    const colores: Record<string, string> = { rojo: '#a8323e', negro: '#34383a', verde: '#2f6b4f' };
    const paradas = this.ordenRueda.map((n, i) => {
      const color = colores[n === 0 ? 'verde' : this.rojos.includes(n) ? 'rojo' : 'negro'];
      return `${color} ${(i * paso).toFixed(3)}deg ${((i + 1) * paso).toFixed(3)}deg`;
    });
    return `conic-gradient(from ${(-paso / 2).toFixed(3)}deg, ${paradas.join(', ')})`;
  })();

  /**
   * Posición de cada número en la mesa clásica: el 0 ocupa la primera columna
   * y el resto se reparte en 12 columnas de 3 filas, con el 3 arriba y el 1 abajo.
   */
  posicion(n: number): { col: number; row: number } {
    if (n === 0) return { col: 1, row: 1 };
    return { col: Math.ceil(n / 3) + 1, row: 3 - ((n - 1) % 3) };
  }

  nombreColor(n: number | null): string {
    if (n === null) return '';
    if (n === 0) return this.t('ruleta.colores.verde');
    return this.t(this.rojos.includes(n) ? 'ruleta.colores.rojo' : 'ruleta.colores.negro');
  }

  /** Nombre accesible de una casilla, con lo apostado si lo hay. */
  etiquetaCasilla(base: string, tipo: string): string {
    const llevas = this.getApuesta(tipo);
    return llevas === null ? base : base + this.t('ruleta.llevas', { fichas: this.i18n.fichas(llevas) });
  }

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

  constructor() {
    const authInstance = this.auth.getAuthInstance();
    authState(authInstance).subscribe(user => {
      if (user) {
        this.user = user;
        this.esCuentaGoogle = user.providerData.some(p => p.providerId === 'google.com');
        this.perfiles.leer(user.uid).then(perfil => {
          if (!perfil) return;
          this.nombre = perfil.nombre || `${this.t('comun.usuario')}.${user.uid.slice(0, 6)}`;
          this.saldo = perfil.saldo;
        });
      }
    });
  }

  seleccionarFicha(valor: number) {
    this.fichaSeleccionada = valor;
  }

  apostar(tipo: string) {
    if (!this.fichaSeleccionada || this.saldo < this.fichaSeleccionada) return;
    const existente = this.apuestas.find(a => a.tipo === tipo);
    if (existente) {
      existente.cantidad += this.fichaSeleccionada;
    } else {
      this.apuestas.push({ tipo, cantidad: this.fichaSeleccionada });
    }
    this.saldo -= this.fichaSeleccionada;
    this.apuestaActual += this.fichaSeleccionada;
  }

  cancelarApuestas() {
    for (const ap of this.apuestas) {
      this.saldo += ap.cantidad;
    }
    this.apuestas = [];
    this.apuestaActual = 0;
  }

  girarRuleta() {
    if (this.apuestas.length === 0 || this.enJuego) return;

    this.enJuego = true;
    const numGanador = Math.floor(Math.random() * 37);
    this.resultado = numGanador;
    let ganancia = 0;

    for (const ap of this.apuestas) {
      const tipo = ap.tipo;
      const cantidad = ap.cantidad;

      if (tipo === String(numGanador)) ganancia += cantidad * 36;
      else if (tipo === 'rojo' && this.rojos.includes(numGanador)) ganancia += cantidad * 2;
      else if (tipo === 'negro' && !this.rojos.includes(numGanador) && numGanador !== 0) ganancia += cantidad * 2;
      else if (tipo === 'par' && numGanador % 2 === 0 && numGanador !== 0) ganancia += cantidad * 2;
      else if (tipo === 'impar' && numGanador % 2 !== 0) ganancia += cantidad * 2;
      else if (tipo === '1-18' && numGanador >= 1 && numGanador <= 18) ganancia += cantidad * 2;
      else if (tipo === '19-36' && numGanador >= 19 && numGanador <= 36) ganancia += cantidad * 2;
    }

    setTimeout(() => {
      this.saldo += ganancia;
      this.actualizarSaldoEnFirestore();
      this.resultadoMensaje = { ganancia };
      this.apuestas = [];
      this.apuestaActual = 0;
      this.enJuego = false;
    }, 1000);
  }

  actualizarSaldoEnFirestore() {
    if (!this.user) return;
    this.perfiles.actualizar(this.user.uid, { saldo: this.saldo })
      .catch(() => (this.errorSaldo = 'errores.saldo'));
  }

  getColor(num: number): string {
    if (num === 0) return 'verde';
    return this.rojos.includes(num) ? 'rojo' : 'negro';
  }

  getApuesta(tipo: string): number | null {
    const ap = this.apuestas.find(a => a.tipo === tipo);
    return ap ? ap.cantidad : null;
  }
  getColorClaseResultado(): string {
    if (this.resultado === null) return '';
    if (this.resultado === 0) return 'verde';
    const rojos = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    return rojos.includes(this.resultado) ? 'rojo' : 'negro';
  }


  // Header
  onChangeName() { this.errorNombre = null; this.mostrarModalNombre = true; }
  onChangePassword() { this.errorPassword = null; this.mostrarModalPassword = true; }
  onAddSaldo() {
    this.errorSaldo = null;
    this.mostrarScratch = true;
    this.cantidadGanada = this.generarPremio();
    this.rascado = true;
  }
  onLogout() { this.auth.logout().subscribe(() => this.router.navigate(['/login'])); }
  onGoHome() {
    this.router.navigate(['/']);
  }
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
}
