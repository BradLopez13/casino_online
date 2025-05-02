import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { onAuthStateChanged, User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule]
})
export class HomeComponent {
  user: User | null = null;
  saldo = 1500; 
  fichas = 250;
  juegos = [
    { nombre: 'Tragaperras', descripcion: 'Prueba suerte en las slots', ruta: '/slots' },
    { nombre: 'Ruleta', descripcion: 'Apuesta al rojo o negro', ruta: '/ruleta' },
    { nombre: 'Blackjack', descripcion: 'Llega a 21 sin pasarte', ruta: '/blackjack' }
  ];

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    onAuthStateChanged(this.auth['auth'], user => {
      this.user = user;
    });
  }
  menuAbierto = false;

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
