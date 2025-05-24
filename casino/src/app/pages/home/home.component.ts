import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { authState, User, updatePassword } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ModalComponent } from '../modal/modal.component';
import { AgeVerificationComponent } from '../age-verification/age-verification.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    HeaderComponent,
    AgeVerificationComponent,
    ModalComponent
  ]
})
export class HomeComponent {
  user: User | null = null;
  saldo = 0;
  nombre = '';
  mayorDeEdad = false;

  // Modals
  mostrarModalNombre = false;
  mostrarModalSaldo = false;
  mostrarModalPassword = false;

  errorNombre: string | null = null;
  errorSaldo: string | null = null;
  errorPassword: string | null = null;
  esCuentaGoogle = false;

  juegos = [
    { nombre: 'Tragaperras', descripcion: 'Prueba suerte en las slots', ruta: '/slots' },
    { nombre: 'Ruleta', descripcion: 'Apuesta al rojo o negro', ruta: '/ruleta' },
    { nombre: 'Blackjack', descripcion: 'Llega a 21 sin pasarte', ruta: '/blackjack' }
  ];

  private auth = inject(AuthService);
  private firestore = inject(Firestore);
  private router = inject(Router);

  constructor() {
    authState(this.auth.getAuthInstance()).subscribe(async user => {
      if (user) {
        this.user = user;
        this.esCuentaGoogle = user.providerData.some(p => p.providerId === 'google.com');
        const refDoc = doc(this.firestore, `usuarios/${user.uid}`);
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          const data = snap.data();
          this.nombre = data['nombre'] || '';
          this.saldo = data['saldo'] ?? 0;
          this.mayorDeEdad = data['mayorDeEdad'] === true;
        }
      }
    });
  }

  get nombreVisual(): string {
    return this.nombre.trim() ? this.nombre : this.user ? `usuario.${this.user.uid.substring(0,6)}` : 'usuario';
  }

  // Event handlers from header
  onChangeName() { this.errorNombre = null; this.mostrarModalNombre = true; }
  onChangePassword() { this.errorPassword = null; this.mostrarModalPassword = true; }
  onAddSaldo() { this.errorSaldo = null; this.mostrarModalSaldo = true; }
  onLogout() { this.auth.logout().subscribe(() => this.router.navigate(['/login'])); }

  // Modals callbacks
  onNombreModal(res: boolean | string | File) {
    this.mostrarModalNombre = false;
    this.errorNombre = null;
    if (typeof res === 'string' && res.trim() && this.user) {
      const nuevo = res.trim();
      updateDoc(doc(this.firestore, `usuarios/${this.user.uid}`), { nombre: nuevo })
        .then(()=> this.nombre = nuevo)
        .catch(()=>{ this.errorNombre='Error al guardar nombre'; this.mostrarModalNombre=true; });
    } else if (typeof res==='string') {
      this.errorNombre='Nombre no válido'; this.mostrarModalNombre=true;
    }
  }

  onSaldoModal(res: boolean | string | File) {
    this.mostrarModalSaldo = false;
    this.errorSaldo = null;
    if (typeof res==='string' && this.user) {
      const val = parseFloat(res);
      if (isNaN(val)||val<=0) { this.errorSaldo='Cantidad inválida'; this.mostrarModalSaldo=true; return; }
      const nuevo = this.saldo+val;
      updateDoc(doc(this.firestore, `usuarios/${this.user.uid}`), { saldo: nuevo })
        .then(()=> this.saldo=nuevo)
        .catch(()=>{ this.errorSaldo='Error al actualizar saldo'; this.mostrarModalSaldo=true; });
    }
  }

  onPasswordModal(res: boolean | string | File) {
    this.mostrarModalPassword = false;
    this.errorPassword = null;
    if (this.esCuentaGoogle) return;
    if (typeof res==='string' && res.length>=6 && this.user) {
      updatePassword(this.user, res)
        .catch(()=>{ this.errorPassword='Error al cambiar contraseña'; this.mostrarModalPassword=true; });
    } else if (typeof res==='string') {
      this.errorPassword='Mínimo 6 caracteres'; this.mostrarModalPassword=true;
    }
  }

  confirmarMayorDeEdad() { this.mayorDeEdad=true; if (this.user) this.auth.setMayorDeEdad(this.user.uid).subscribe(); }

  jugar(ruta: string) { this.router.navigate([ruta]); }
}