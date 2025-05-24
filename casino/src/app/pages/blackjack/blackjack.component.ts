import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blackjack',
  standalone: true,
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.scss'],
  imports: [CommonModule, HeaderComponent]
})
export class BlackjackComponent {
  private auth = inject(AuthService);
  private firestore = inject(Firestore);
  private router = inject(Router);

  nombre = '';
  saldo = 1000;

  palos = ['♠', '♥', '♦', '♣'];
  valores = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  deck: string[] = [];
  playerHand: string[] = [];
  dealerHand: string[] = [];

  apuesta = 0;
  mostrarApuesta = true;
  mensajeApuesta = '';

  juegoTerminado = false;
  resultado = '';
  turnoJugador = true;

  constructor() {
    const user = this.auth.getAuthInstance().currentUser;
    if (user) {
      const ref = doc(this.firestore, `usuarios/${user.uid}`);
      getDoc(ref).then(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          this.nombre = data['nombre'] || `usuario.${user.uid.slice(0, 6)}`;
          this.saldo = data['saldo'] ?? 0;
        }
      });
    }

    this.iniciarJuego(); // Empezar partida automáticamente
  }

  // Header events
  onChangeName() {}
  onChangePassword() {}
  onAddSaldo() {}
  onLogout() {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
  onGoHome() {
    this.router.navigate(['/']);
  }

  iniciarJuego() {
    this.crearBaraja();
    this.playerHand = [this.deck.pop()!, this.deck.pop()!];
    this.dealerHand = [this.deck.pop()!];
    this.juegoTerminado = false;
    this.resultado = '';
    this.turnoJugador = true;
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

  pedirCarta() {
    if (this.turnoJugador && !this.juegoTerminado) {
      this.playerHand.push(this.deck.pop()!);
      if (this.calcularPuntos(this.playerHand) > 21) {
        this.resultado = 'Te has pasado. Pierdes.';
        this.juegoTerminado = true;
      }
    }
  }

  plantarse() {
    this.turnoJugador = false;
    while (this.calcularPuntos(this.dealerHand) < 17) {
      this.dealerHand.push(this.deck.pop()!);
    }
    this.evaluarGanador();
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
        ases += 1;
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
    const user = this.auth.getAuthInstance().currentUser;

    let ganancias = 0;

    if (puntosDealer > 21 || puntosJugador > puntosDealer) {
      this.resultado = '¡Ganaste!';
      ganancias = this.apuesta * 2;
      this.saldo += ganancias;
    } else if (puntosJugador < puntosDealer) {
      this.resultado = 'Perdiste.';
      // saldo ya se restó
    } else {
      this.resultado = 'Empate.';
      this.saldo += this.apuesta; // se devuelve la apuesta
    }

    if (user) {
      const ref = doc(this.firestore, `usuarios/${user.uid}`);
      updateDoc(ref, { saldo: this.saldo });
    }

    this.juegoTerminado = true;
  }

  apostar(cantidad: string) {
    const apuestaNum = parseFloat(cantidad);

    if (isNaN(apuestaNum) || apuestaNum <= 0) {
      this.mensajeApuesta = 'Introduce una cantidad válida.';
      return;
    }

    if (apuestaNum > this.saldo) {
      this.mensajeApuesta = 'No tienes saldo suficiente.';
      return;
    }

    this.apuesta = apuestaNum;
    this.saldo -= apuestaNum;
    this.mostrarApuesta = false;
    this.mensajeApuesta = '';

    const user = this.auth.getAuthInstance().currentUser;
    if (user) {
      const ref = doc(this.firestore, `usuarios/${user.uid}`);
      updateDoc(ref, { saldo: this.saldo });
    }

    this.iniciarJuego();
  }

}
