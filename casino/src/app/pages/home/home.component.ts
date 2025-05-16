import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { doc, getDoc, updateDoc, Firestore } from '@angular/fire/firestore';
import { authState, User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { AgeVerificationComponent } from '../age-verification/age-verification.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, AgeVerificationComponent]
})
export class HomeComponent {
  user: User | null = null;
  saldo = 0;
  fichas = 0;
  menuAbierto = false;
  mayorDeEdad = false;

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
        const docRef = doc(this.firestore, `usuarios/${user.uid}`);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          this.saldo = data['saldo'] ?? 0;
          this.fichas = data['fichas'] ?? 0;
          this.mayorDeEdad = data['mayorDeEdad'] === true;
        } else {
          console.warn('Documento de usuario no encontrado en Firestore.');
        }
      }
    });
  }

  confirmarMayorDeEdad() {
    this.mayorDeEdad = true;
    if (this.user) {
      const ref = doc(this.firestore, `usuarios/${this.user.uid}`);
      updateDoc(ref, { mayorDeEdad: true });
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cambiarNombre() {
    alert('Funcionalidad cambiar nombre');
  }

  cambiarFoto() {
    alert('Funcionalidad cambiar foto de perfil');
  }

  cambiarPassword() {
    alert('Funcionalidad cambiar contraseña');
  }

  anadirSaldo() {
    alert('Funcionalidad añadir saldo');
  }

  logout() {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }

  jugar(ruta: string) {
    this.router.navigate([ruta]);
  }
}
