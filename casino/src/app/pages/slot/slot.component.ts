import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ModalComponent } from '../modal/modal.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { authState, updatePassword, User } from '@angular/fire/auth';

@Component({
  selector: 'app-slot',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ModalComponent, FormsModule],
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

  reels = ['🍒', '🍋', '🔔'];
  allSymbols = ['🍒', '🍋', '🍇', '🔔', '💎', '7️⃣'];
  apuesta = 10;
  isSpinning = false;
  mensajeApuesta = '';
  mensajeResultado = '';

  mostrarModalNombre = false;
  mostrarModalSaldo = false;
  mostrarModalPassword = false;
  errorNombre: string | null = null;
  errorSaldo: string | null = null;
  errorPassword: string | null = null;
  esCuentaGoogle = false;

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
      this.reels = [
        this.randomSymbol(),
        this.randomSymbol(),
        this.randomSymbol()
      ];

      this.isSpinning = false;

      const [a, b, c] = this.reels;
      if (a === b && b === c) {
        this.mensajeResultado = '¡Jackpot! Has ganado x10 tu apuesta 🎉';
        this.saldo += this.apuesta * 10;
      } else if (a === b || b === c || a === c) {
        this.mensajeResultado = '¡Bien! Has ganado x2 tu apuesta 🎉';
        this.saldo += this.apuesta * 2;
      } else {
        this.mensajeResultado = 'Sigue intentándolo...';
      }

      this.actualizarSaldo();
    }, 1000);
  }

  randomSymbol(): string {
    const index = Math.floor(Math.random() * this.allSymbols.length);
    return this.allSymbols[index];
  }

  actualizarSaldo() {
    if (this.user) {
      const ref = doc(this.firestore, `usuarios/${this.user.uid}`);
      updateDoc(ref, { saldo: this.saldo });
    }
  }

  // Header
  onChangeName() { this.errorNombre = null; this.mostrarModalNombre = true; }
  onChangePassword() { this.errorPassword = null; this.mostrarModalPassword = true; }
  onAddSaldo() { this.errorSaldo = null; this.mostrarModalSaldo = true; }
  onLogout() {this.auth.logout().subscribe(() => this.router.navigate(['/login']));}
  onGoHome() {this.router.navigate(['/']);}
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
  onSaldoModal(res: string | boolean) {
    if (res === false) {
      this.mostrarModalSaldo = false;
      return;
    }

    this.mostrarModalSaldo = false;
    this.errorSaldo = null;

    if (typeof res === 'string' && this.user) {
      const cantidad = parseFloat(res);

      if (isNaN(cantidad) || cantidad <= 0) {
        this.errorSaldo = 'Cantidad inválida.';
        this.mostrarModalSaldo = true;
        return;
      }

      this.saldo += cantidad;
      const ref = doc(this.firestore, `usuarios/${this.user.uid}`);
      updateDoc(ref, { saldo: this.saldo }).catch(() => {
        this.errorSaldo = 'Error al actualizar saldo.';
        this.mostrarModalSaldo = true;
      });
    } else {
      this.errorSaldo = 'Entrada inválida.';
      this.mostrarModalSaldo = true;
    }
  }
}
