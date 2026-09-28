import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ModalComponent } from '../modal/modal.component';
import { authState, updatePassword, User } from '@angular/fire/auth';
import { ScratchModalComponent } from '../scratch-modal/scratch-modal.component';


@Component({
  selector: 'app-blackjack',
  standalone: true,
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.scss'],
  imports: [CommonModule, HeaderComponent, ModalComponent, ScratchModalComponent]
})
export class BlackjackComponent {
  private auth = inject(AuthService);
  private firestore = inject(Firestore);
  private router = inject(Router);

  user: User | null = null;

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

  nombre = '';
  saldo = 1000;

  palos = ['♠', '♥', '♦', '♣'];
  valores = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  deck: string[] = [];
  playerHand: string[] = [];
  dealerHand: string[] = [];

  apuesta = 0;
  mensajeApuesta = '';

  juegoTerminado = false;
  resultado = '';
  turnoJugador = false;

  fichas = [10, 20, 50, 100, 500];

  constructor() {
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

    this.resetearJuego();
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
  onLogout() {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
  onGoHome() {
    this.router.navigate(['/']);
  }
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



  resetearJuego() {
    this.juegoTerminado = false;
    this.resultado = '';
    this.apuesta = 0;
    this.playerHand = [];
    this.dealerHand = [];
    this.turnoJugador = false;
  }

  crearBaraja() {
    const nuevaBaraja = [];
    for (const palo of this.palos) {
      for (const valor of this.valores) {
        nuevaBaraja.push(`${valor}${palo}`);
      }
    }
    for (let i = nuevaBaraja.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nuevaBaraja[i], nuevaBaraja[j]] = [nuevaBaraja[j], nuevaBaraja[i]];
    }
    this.deck = nuevaBaraja;
  }

  apostar(cantidad: number) {
    if (isNaN(cantidad) || cantidad <= 0) {
      this.mensajeApuesta = 'Cantidad inválida';
      return;
    }

    if (this.saldo < cantidad) {
      this.mensajeApuesta = 'No tienes suficiente saldo';
      return;
    }

    this.apuesta = cantidad;
    this.saldo -= cantidad;
    this.mensajeApuesta = '';
    this.actualizarSaldo();

    this.crearBaraja();
    this.playerHand = [this.deck.pop()!, this.deck.pop()!];
    this.dealerHand = [this.deck.pop()!];
    this.turnoJugador = true;
  }

  pedirCarta() {
    if (!this.turnoJugador || this.juegoTerminado) return;

    this.playerHand.push(this.deck.pop()!);
    if (this.calcularPuntos(this.playerHand) > 21) {
      this.resultado = 'Te has pasado. Pierdes.';
      this.juegoTerminado = true;
    }
  }

  plantarse() {
    this.turnoJugador = false;
    while (this.calcularPuntos(this.dealerHand) < 17) {
      this.dealerHand.push(this.deck.pop()!);
    }
    this.evaluarGanador();
  }

  /* Ayudas de presentación: una carta es "10♥" → valor "10", palo "♥". */
  valorDe(carta: string): string {
    return carta.slice(0, -1);
  }

  paloDe(carta: string): string {
    return carta.slice(-1);
  }

  esRoja(carta: string): boolean {
    const palo = this.paloDe(carta);
    return palo === '♥' || palo === '♦';
  }

  describirCarta(carta: string): string {
    const nombres: Record<string, string> = { A: 'As', J: 'Jota', Q: 'Reina', K: 'Rey' };
    const palos: Record<string, string> = { '♠': 'picas', '♥': 'corazones', '♦': 'diamantes', '♣': 'tréboles' };
    const valor = this.valorDe(carta);
    return `${nombres[valor] ?? valor} de ${palos[this.paloDe(carta)] ?? ''}`.trim();
  }

  get resultadoClase(): string {
    if (this.resultado.includes('Ganaste')) return 'win';
    if (this.resultado.includes('Empate')) return '';
    return 'lose';
  }

  calcularPuntos(mano: string[]): number {
    let total = 0;
    let ases = 0;
    for (const carta of mano) {
      const valor = carta.slice(0, -1);
      if (['J', 'Q', 'K'].includes(valor)) {
        total += 10;
      } else if (valor === 'A') {
        total += 11;
        ases++;
      } else {
        total += +valor;
      }
    }
    while (total > 21 && ases > 0) {
      total -= 10;
      ases--;
    }
    return total;
  }

  evaluarGanador() {
    const puntosJugador = this.calcularPuntos(this.playerHand);
    const puntosDealer = this.calcularPuntos(this.dealerHand);

    if (puntosDealer > 21 || puntosJugador > puntosDealer) {
      this.resultado = '¡Ganaste!';
      this.saldo += this.apuesta * 2;
    } else if (puntosJugador < puntosDealer) {
      this.resultado = 'Perdiste.';
    } else {
      this.resultado = 'Empate.';
      this.saldo += this.apuesta;
    }

    this.actualizarSaldo();
    this.juegoTerminado = true;
  }

  actualizarSaldo() {
    if (this.user) {
      const ref = doc(this.firestore, `usuarios/${this.user.uid}`);
      updateDoc(ref, { saldo: this.saldo });
    }
  }
}
