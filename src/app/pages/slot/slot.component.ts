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


@Component({
  selector: 'app-slot',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ModalComponent, FormsModule, ScratchModalComponent, IconComponent],
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.scss']
})
export class SlotComponent {
  private auth = inject(AuthService);
  private firestore = inject(Firestore);
  private router = inject(Router);

  nombre = '';
  saldo = 1000;
  user: User | null = null;
  reels = [['', '', ''], ['', '', ''], ['', '', '']];
  symbols = ['🍒', '🍋', '🍇', '🔔', '💎', '7️⃣'];
  isSpinning = false;
  apuesta = 10;
  mensajeApuesta = '';
  mensajeResultado = '';

  mostrarModalNombre = false;
  mostrarModalSaldo = false;
  mostrarModalPassword = false;
  errorNombre: string | null = null;
  errorSaldo: string | null = null;
  errorPassword: string | null = null;
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
            this.nombre = data['nombre'] || `usuario.${user.uid.slice(0, 6)}`;
            this.saldo = data['saldo'] ?? 0;
          }
        });
      }
    });
  }

  spin() {
    if (this.apuesta <= 0 || this.saldo < this.apuesta) {
      this.mensajeApuesta = 'Saldo insuficiente o apuesta inválida';
      return;
    }

    this.mensajeApuesta = '';
    this.mensajeResultado = '';
    this.saldo -= this.apuesta;
    this.actualizarSaldo();
    this.isSpinning = true;

    setTimeout(() => {
      this.reels = this.reels.map(col => col.map(() => this.randomSymbol()));
      this.isSpinning = false;
      const ganancia = this.calcularGanancia();
      if (ganancia > 0) {
        this.mensajeResultado = `¡Ganaste ${ganancia} €!`;
        this.saldo += ganancia;
      } else {
        this.mensajeResultado = 'Sigue intentándolo...';
      }
      this.actualizarSaldo();
    }, 1000);
  }

  /* Presentación: cada símbolo de datos se dibuja con un icono y se nombra en voz alta. */
  private readonly iconos = ['cherry', 'lemon', 'grape', 'bell', 'diamond', 'seven'];
  private readonly nombres = ['Cereza', 'Limón', 'Uva', 'Campana', 'Diamante', 'Siete'];

  iconoDe(simbolo: string): string {
    const i = this.symbols.indexOf(simbolo);
    return i >= 0 ? this.iconos[i] : 'blank';
  }

  nombreDe(simbolo: string): string {
    const i = this.symbols.indexOf(simbolo);
    return i >= 0 ? this.nombres[i] : 'Vacío';
  }

  get paytable() {
    return this.symbols.map((s, i) => ({ icono: this.iconos[i], nombre: this.nombres[i], multiplicador: this.obtenerMultiplicador(s) }));
  }

  get resultadoClase(): string {
    return this.mensajeResultado.startsWith('¡Ganaste') ? 'win' : 'lose';
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
        this.errorNombre = 'Error al guardar el nombre.';
        this.mostrarModalNombre = true;
      });
    } else {
      this.errorNombre = 'Nombre no válido.';
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
        this.errorPassword = 'Error al cambiar la contraseña.';
        this.mostrarModalPassword = true;
      });
    } else {
      this.errorPassword = 'La contraseña debe tener al menos 6 caracteres.';
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
        .catch(() => this.errorSaldo = 'Error al actualizar saldo');
    }
  }
}
