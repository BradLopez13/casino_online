import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form!: FormGroup;
  error: string | null = null;
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
  goToRegister() {
    this.router.navigate(['/register']);
  }
  
  private getFirebaseError(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'Usuario no registrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      default:
        return 'Error de autenticación';
    }
  }
}
