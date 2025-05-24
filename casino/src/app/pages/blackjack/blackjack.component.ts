import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blackjack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.scss']
})
export class BlackjackComponent {
  deck: string[] = [];
  playerCards: string[] = [];
  dealerCards: string[] = [];
  playerTotal = 0;
  dealerTotal = 0;
  message = '';
  gameOver = false;
  gameStarted = false;

  // Usuario y menú integrados
  menuAbierto = false;
  nombre = 'usuario'; // inyectar desde Home si es necesario
  saldo = 0;

  constructor(private router: Router) {
    // podrías inyectar AuthService para cargar nombre y saldo reales
  }

  startGame() {
    this.resetGame();
    this.deck = this.createShuffledDeck();
    this.dealInitial();
    this.calculateTotals();
    this.gameStarted = true;
  }

  resetGame() {
    this.deck = [];
    this.playerCards = [];
    this.dealerCards = [];
    this.playerTotal = 0;
    this.dealerTotal = 0;
    this.message = '';
    this.gameOver = false;
    this.gameStarted = false;
  }

  createShuffledDeck(): string[] {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const d: string[] = [];
    for (let s of suits) for (let v of values) d.push(`${v}${s}`);
    return d.sort(() => Math.random() - 0.5);
  }

  dealInitial() {
    this.playerCards = [this.draw(), this.draw()];
    this.dealerCards = [this.draw(), this.draw()];
  }

  draw(): string {
    return this.deck.pop()!;
  }

  calculateTotals() {
    this.playerTotal = this.score(this.playerCards);
    this.dealerTotal = this.score(this.dealerCards);
  }

  score(hand: string[]): number {
    let total=0, aces=0;
    for (let c of hand) {
      const v=c.slice(0,-1);
      if (['J','Q','K'].includes(v)) total+=10;
      else if (v==='A') {aces++; total+=11;} else total+=+v;
    }
    while(total>21 && aces-- >0) total-=10;
    return total;
  }

  hit() {
    if (!this.gameStarted||this.gameOver) return;
    this.playerCards.push(this.draw());
    this.calculateTotals();
    if (this.playerTotal>21) this.end('Te pasaste. Pierdes.');
  }

  stand() {
    if (!this.gameStarted||this.gameOver) return;
    while(this.dealerTotal<17) {
      this.dealerCards.push(this.draw());
      this.calculateTotals();
    }
    if(this.dealerTotal>21||this.playerTotal>this.dealerTotal) this.end('¡Has ganado!');
    else if(this.playerTotal<this.dealerTotal) this.end('La casa gana.');
    else this.end('Empate.');
  }

  end(msg: string) {
    this.message = msg;
    this.gameOver = true;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  volverHome() {
    this.router.navigate(['/']);
  }
}