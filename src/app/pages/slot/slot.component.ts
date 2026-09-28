import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ModalComponent } from '../modal/modal.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { authState, updatePassword, User } from '@angular/fire/auth';
import { ScratchModalComponent } from '../scratch-modal/scratch-modal.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { FichasPipe } from '../../ui/fichas.pipe';
import { Clave, useI18n } from '../../i18n/i18n.service';


@Component({
  selector: 'app-slot',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ModalComponent, FormsModule, ScratchModalComponent, IconComponent, FichasPipe],
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.scss']
})
export class SlotComponent {
  protected readonly i18n = useI18n();
  protected readonly t = this.i18n.t;

  private auth = inject(AuthService);
  private firestore = inject(Firestore);
  private router = inject(Router);

  nombre = '';
  saldo = 1000;
  user: User | null = null;
  symbols = ['🍒', '🍋', '🍇', '🔔', '💎', '7️⃣'];
  /** Combinación de reposo sin ninguna línea ganadora; se muestra atenuada hasta la primera tirada. */
  reels = [['🍋', '🍒', '🔔'], ['💎', '7️⃣', '🍇'], ['🍇', '🔔', '🍋']];
  sinTirar = true;
  isSpinning = false;
  apuesta = 10;
  mensajeApuesta: Clave | null = null;
  /** Resultado de la última tirada; se traduce al pintarse. */
  resultado: { gana: boolean; fichas: number } | null = null;

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
    const user = this.auth.getAuthInstance().currentUser;
    authState(this.auth.getAuthInstance()).subscribe(user => {
      if (user) {
        this.user = user;
        this.esCuentaGoogle = user.providerData.some(p => p.providerId === 'google.com');
        const ref = doc(this.firestore, `usuarios/${user.uid}`);
        getDoc(ref).then(snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            this.nombre = data['nombre'] || `${this.t('comun.usuario')}.${user.uid.slice(0, 6)}`;
            this.saldo = data['saldo'] ?? 0;
          }
        });
      }
    });
  }

  spin() {
    if (this.apuesta <= 0 || this.saldo < this.apuesta) {
      this.mensajeApuesta = 'slot.errorApuesta';
      return;
    }

    this.mensajeApuesta = null;
    this.resultado = null;
    this.saldo -= this.apuesta;
    this.actualizarSaldo();
    this.isSpinning = true;
    this.sinTirar = false;

    setTimeout(() => {
      this.reels = this.reels.map(col => col.map(() => this.randomSymbol()));
      this.isSpinning = false;
      const ganancia = this.calcularGanancia();
      this.resultado = { gana: ganancia > 0, fichas: ganancia };
      this.saldo += ganancia;
      this.actualizarSaldo();
    }, 1000);
  }

  /* Presentación: cada símbolo de datos se dibuja con un icono y se nombra en voz alta. */
  private readonly iconos = ['cherry', 'lemon', 'grape', 'bell', 'diamond', 'seven'];
  private readonly nombres: Clave[] = [
    'slot.simbolos.cereza', 'slot.simbolos.limon', 'slot.simbolos.uva',
    'slot.simbolos.campana', 'slot.simbolos.diamante', 'slot.simbolos.siete'
  ];

  iconoDe(simbolo: string): string {
    const i = this.symbols.indexOf(simbolo);
    return i >= 0 ? this.iconos[i] : 'blank';
  }

  nombreDe(simbolo: string): string {
    const i = this.symbols.indexOf(simbolo);
    return this.t(i >= 0 ? this.nombres[i] : 'slot.simbolos.vacio');
  }

  get paytable() {
    return this.symbols.map((s, i) => ({ icono: this.iconos[i], nombre: this.t(this.nombres[i]), multiplicador: this.obtenerMultiplicador(s) }));
  }

  get resultadoClase(): string {
    return this.resultado?.gana ? 'win' : 'lose';
  }

  get mensajeResultado(): string {
    if (!this.resultado) return '';
    return this.resultado.gana
      ? this.t('slot.gana', { fichas: this.i18n.fichas(this.resultado.fichas) })
      : this.t('slot.sinPremio');
  }

  randomSymbol(): string {
    const i = Math.floor(Math.random() * this.symbols.length);
    return this.symbols[i];
  }

  calcularGanancia(): number {
    const lineas = [
      [this.reels[0][0], this.reels[1][0], this.reels[2][0]],
      [this.reels[0][1], this.reels[1][1], this.reels[2][1]],
      [this.reels[0][2], this.reels[1][2], this.reels[2][2]],
      [this.reels[0][0], this.reels[1][1], this.reels[2][2]],
      [this.reels[0][2], this.reels[1][1], this.reels[2][0]]
    ];

    let ganancia = 0;

    for (const linea of lineas) {
      if (linea.every(s => s === linea[0])) {
        const simbolo = linea[0];
        const multiplicador = this.obtenerMultiplicador(simbolo);
        ganancia += this.apuesta * multiplicador;
      }
    }

    return ganancia;
  }

  obtenerMultiplicador(simbolo: string): number {
    switch (simbolo) {
      case '🍒': return 2;
      case '🍋': return 3;
      case '🍇': return 4;
      case '🔔': return 5;
      case '💎': return 10;
      case '7️⃣': return 15;
      default: return 0;
    }
  }

  actualizarSaldo() {
    if (this.user) {
      const ref = doc(this.firestore, `usuarios/${this.user.uid}`);
      updateDoc(ref, { saldo: this.saldo });
    }
  }

  onChangeName() { this.errorNombre = null; this.mostrarModalNombre = true; }
  onChangePassword() { this.errorPassword = null; this.mostrarModalPassword = true; }
  onAddSaldo() {
    this.errorSaldo = null;
    this.mostrarScratch = true;
    this.cantidadGanada = this.generarPremio();
    this.rascado = true;
  }  
  onLogout() { this.auth.logout().subscribe(() => this.router.navigate(['/login'])); }
  onGoHome() { this.router.navigate(['/']); }

  onNombreModal(res: string | boolean) {
    if (res === false) {
      this.mostrarModalNombre = false;
      return;
    }

    this.mostrarModalNombre = false;
    this.errorNombre = null;

    if (typeof res === 'string' && res.trim() && this.user) {
      const nuevoNombre = res.trim();
      const refDoc = doc(this.firestore, `usuarios/${this.user.uid}`);
      updateDoc(refDoc, { nombre: nuevoNombre }).then(() => {
        this.nombre = nuevoNombre;
      }).catch(() => {
        this.errorNombre = 'errores.nombreGuardar';
        this.mostrarModalNombre = true;
      });
    } else {
      this.errorNombre = 'errores.nombreVacio';
      this.mostrarModalNombre = true;
    }
  }

  onPasswordModal(res: string | boolean) {
    if (res === false) {
      this.mostrarModalPassword = false;
      return;
    }

    this.mostrarModalPassword = false;
    this.errorPassword = null;

    if (this.esCuentaGoogle) return;

    if (typeof res === 'string' && res.length >= 6 && this.user) {
      updatePassword(this.user, res).catch(() => {
        this.errorPassword = 'errores.passwordGuardar';
        this.mostrarModalPassword = true;
      });
    } else {
      this.errorPassword = 'errores.passwordCorta';
      this.mostrarModalPassword = true;
    }
  }
  generarPremio(): number {
    const premios = [0, 0, 0, 2, 5, 10, 20];
    const index = Math.floor(Math.random() * premios.length);
    return premios[index];
  }
  onCerrarScratch() {
    this.mostrarScratch = false;
    if (this.cantidadGanada > 0 && this.user) {
      const nuevoSaldo = this.saldo + this.cantidadGanada;
      updateDoc(doc(this.firestore, `usuarios/${this.user.uid}`), { saldo: nuevoSaldo })
        .then(() => this.saldo = nuevoSaldo)
        .catch(() => this.errorSaldo = 'errores.saldo');
    }
  }
}
