import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { BlackjackComponent } from './pages/blackjack/blackjack.component';
import { authGuard } from './guards/auth.guard';
import { mayorDeEdadGuard } from './guards/mayor-de-edad.guard';
import { SlotComponent } from './pages/slot/slot.component';
import { RuletaComponent } from './pages/ruleta/ruleta.component';
import { from } from 'rxjs';

export const routes: Routes = [
  // Rutas públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Ruta protegida
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  {path: 'blackjack',component: BlackjackComponent, canActivate: [authGuard, mayorDeEdadGuard]},
  {path: 'slot',component: SlotComponent, canActivate: [authGuard, mayorDeEdadGuard]},
  {path: 'ruleta',component: RuletaComponent, canActivate: [authGuard, mayorDeEdadGuard]},

  // Redirección por defecto
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  

  
  // Ruta 404 opcional
  { path: '**', redirectTo: 'home' }
];
