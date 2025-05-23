import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { authState, User, updatePassword } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { AgeVerificationComponent } from '../age-verification/age-verification.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, AgeVerificationComponent, ModalComponent]
})
export class HomeComponent {
  user: User | null = null;
  saldo = 0;
  nombre = '';
  mayorDeEdad = false;
  menuAbierto = false;

  mostrarModalNombre = false;
  mostrarModalSaldo = false;
  mostrarModalPassword = false;

  errorNombre: string | null = null;
  errorSaldo: string | null = null;
  errorPassword: string | null = null;

  juegos = [
    { nombre: 'Tragaperras', descripcion: 'Prueba suerte en las slots', ruta: '/slots' },
    { nombre: 'Ruleta', descripcion: 'Apuesta al rojo o negro', ruta: '/ruleta' },
    { nombre: 'Blackjack', descripcion: 'Llega a 21 sin pasarte', ruta: '/blackjack' }
  ];

  private auth = inject(AuthService);
  private firestore = inject(Firestore);
  private router = inject(Router);

  constructor() {
    authState(this.auth.getAuthInstance()).subscribe(async (user) => {
      if (user) {
        this.user = user;
        const refDoc = doc(this.firestore, `usuarios/${user.uid}`);
        const snapshot = await getDoc(refDoc);
        if (snapshot.exists()) {
          const data = snapshot.data();
          this.nombre = data['nombre'] || '';
          this.saldo = data['saldo'] ?? 0;
          this.mayorDeEdad = data['mayorDeEdad'] === true;
        }
      }
    });
  }

  get nombreVisual(): string {
    if (this.nombre.trim()) {
      return this.nombre;
    } else if (this.user) {
      return `usuario.${this.user.uid.substring(0, 6)}`;
    }
    return 'usuario';
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cambiarNombre() {
    this.errorNombre = null;
    this.mostrarModalNombre = true;
  }

  anadirSaldo() {
    this.errorSaldo = null;
    this.mostrarModalSaldo = true;
  }

  cambiarPassword() {
    this.errorPassword = null;
    this.mostrarModalPassword = true;
  }

  onNombreModal(res: boolean | string | File) {
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
    } else if (typeof res === 'string') {
      this.errorNombre = 'Nombre no válido.';
      this.mostrarModalNombre = true;
    }
  }

  onSaldoModal(res: boolean | string | File) {
    this.mostrarModalSaldo = false;
    this.errorSaldo = null;

    if (typeof res === 'string' && this.user) {
      const cantidad = parseFloat(res);
      if (isNaN(cantidad) || cantidad <= 0) {
        this.errorSaldo = 'Cantidad inválida.';
        this.mostrarModalSaldo = true;
        return;
      }
      const nuevoSaldo = this.saldo + cantidad;
      const refDoc = doc(this.firestore, `usuarios/${this.user.uid}`);
      updateDoc(refDoc, { saldo: nuevoSaldo }).then(() => {
        this.saldo = nuevoSaldo;
      }).catch(() => {
        this.errorSaldo = 'Error al actualizar saldo.';
        this.mostrarModalSaldo = true;
      });
    }
  }

  onPasswordModal(res: boolean | string | File) {
    this.mostrarModalPassword = false;
    this.errorPassword = null;

    if (typeof res === 'string' && res.length >= 6 && this.user) {
      updatePassword(this.user, res).then(() => {
        // contraseña actualizada
      }).catch(() => {
        this.errorPassword = 'Error al cambiar la contraseña.';
        this.mostrarModalPassword = true;
      });
    } else if (typeof res === 'string') {
      this.errorPassword = 'La contraseña debe tener al menos 6 caracteres.';
      this.mostrarModalPassword = true;
    }
  }

  confirmarMayorDeEdad() {
    this.mayorDeEdad = true;
    if (this.user) {
      this.auth.setMayorDeEdad(this.user.uid).subscribe();
    }
  }

  logout() {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }

  jugar(ruta: string) {
    this.router.navigate([ruta]);
  }
}
