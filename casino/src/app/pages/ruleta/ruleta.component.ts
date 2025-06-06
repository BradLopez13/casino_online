import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ModalComponent } from '../modal/modal.component';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { authState, User, updatePassword } from '@angular/fire/auth';

@Component({
  selector: 'app-ruleta',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ModalComponent],
  templateUrl: './ruleta.component.html',
  styleUrls: ['./ruleta.component.scss']
})
export class RuletaComponent {
  private auth = inject(AuthService);
  private firestore = inject(Firestore);
  private router = inject(Router);

  nombre = 'Jugador';
  saldo = 1000;
  user: User | null = null;

  apuestaActual = 0;
  apuestas: { tipo: string; cantidad: number }[] = [];
  resultado: number | null = null;
  resultadoMensaje: { texto: string; ganancia: number } | null = null;
  enJuego = false;
  fichaSeleccionada: number | null = null;

  numeros = Array.from({ length: 37 }, (_, i) => i);
  fichas = [1, 5, 10, 25, 50, 100];
  rojos = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

  mostrarModalNombre = false;
  mostrarModalSaldo = false;
  mostrarModalPassword = false;
  errorNombre: string | null = null;
  errorSaldo: string | null = null;
  errorPassword: string | null = null;
  esCuentaGoogle = false;

  constructor() {
    const authInstance = this.auth.getAuthInstance();
    authState(authInstance).subscribe(user => {
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
      this.resultadoMensaje = {
        texto: ganancia > 0 ? `¡Ganaste ${ganancia}€!` : 'No ganaste esta vez.',
        ganancia: ganancia
      };
      this.apuestas = [];
      this.apuestaActual = 0;
      this.enJuego = false;
    }, 1000);
  }

  actualizarSaldoEnFirestore() {
    if (this.user) {
      const ref = doc(this.firestore, `usuarios/${this.user.uid}`);
      updateDoc(ref, { saldo: this.saldo }).catch(err => {
        console.error('Error al actualizar saldo en Firestore:', err);
      });
    }
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
