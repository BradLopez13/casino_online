import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { onAuthStateChanged } from '@angular/fire/auth';
import { IconComponent } from '../../ui/icon/icon.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
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
  private getFirebaseError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este email ya está registrado';
      case 'auth/invalid-email':
        return 'Email inválido';
      default:
        return 'Error al registrar';
    }
  }
}
