import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { onAuthStateChanged } from '@angular/fire/auth';
import { IconComponent } from '../../ui/icon/icon.component';
import { LogoComponent } from '../../ui/logo/logo.component';
import { IdiomaComponent } from '../../ui/idioma/idioma.component';
import { Clave, useT } from '../../i18n/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent, LogoComponent, IdiomaComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  protected readonly t = useT();

  form!: FormGroup;
  error: Clave | null = null;
  rememberMe: boolean = false;

  // Recuperación de contraseña
  recuperando = false;
  recuperacionEnviada = false;
  enviandoRecuperacion = false;
  emailRecuperar = '';
  errorRecuperar: Clave | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    // Redirección si ya hay sesión
    onAuthStateChanged(this.auth['auth'], user => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }

  login() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    this.auth.setPersistence(this.rememberMe).then(() => {
      this.auth.login(email!, password!).subscribe({
        next: () => this.router.navigate(['/']),
        error: err => this.error = this.getFirebaseError(err.code)
      });
    });
  }

  loginWithGoogle() {
    this.auth.setPersistence(this.rememberMe).then(() => {
      this.auth.loginWithGoogle().subscribe({
        next: () => this.router.navigate(['/']),
        error: err => this.error = this.getFirebaseError(err.code)
      });
    });
  }
  abrirRecuperar() {
    this.recuperando = true;
    this.recuperacionEnviada = false;
    this.errorRecuperar = null;
    this.emailRecuperar = this.form.get('email')?.value ?? '';
    requestAnimationFrame(() => document.getElementById('recuperar-email')?.focus());
  }

  cerrarRecuperar() {
    this.recuperando = false;
    requestAnimationFrame(() => document.getElementById('login-email')?.focus());
  }

  /** La confirmación es la misma exista o no la cuenta, para no revelar qué correos están registrados. */
  enviarRecuperacion() {
    const email = this.emailRecuperar.trim();
    if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(email)) {
      this.errorRecuperar = 'login.recuperar.errorEmail';
      return;
    }
    this.errorRecuperar = null;
    this.enviandoRecuperacion = true;
    const terminar = () => {
      this.enviandoRecuperacion = false;
      this.recuperacionEnviada = true;
    };
    this.auth.resetPassword(email).subscribe({ next: terminar, error: terminar });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
  
  private getFirebaseError(code: string): Clave {
    switch (code) {
      case 'auth/user-not-found':
        return 'login.errores.noRegistrado';
      case 'auth/wrong-password':
        return 'login.errores.incorrecta';
      default:
        return 'login.errores.generico';
    }
  }
}
