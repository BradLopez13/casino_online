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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent, LogoComponent, IdiomaComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  protected readonly t = useT();

  form!: FormGroup;
  error: Clave | null = null;
  rememberMe: boolean = false;
  
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

  register() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    this.auth.register(email!, password!).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => this.error = this.getFirebaseError(err.code)
    });
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
  loginWithGoogle() {
    this.auth.setPersistence(this.rememberMe).then(() => {
      this.auth.loginWithGoogle().subscribe({
        next: () => this.router.navigate(['/']),
        error: err => this.error = this.getFirebaseError(err.code)
      });
    });
  }
  private getFirebaseError(code: string): Clave {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'registro.errores.enUso';
      case 'auth/invalid-email':
        return 'registro.errores.emailInvalido';
      default:
        return 'registro.errores.generico';
    }
  }
}
