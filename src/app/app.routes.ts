import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { mayorDeEdadGuard } from './guards/mayor-de-edad.guard';

/*
 * Cada pantalla se descarga al visitarla por primera vez (loadComponent), así
 * el bundle inicial solo lleva el armazón, los guards y Firebase. Las mesas,
 * que además exigen sesión y mayoría de edad, nunca se bajan si no se entra.
 */
export const routes: Routes = [
  // Rutas públicas
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },

  // Salón: requiere sesión
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },

  // Mesas: requieren sesión y mayoría de edad confirmada
  {
    path: 'blackjack',
    canActivate: [authGuard, mayorDeEdadGuard],
    loadComponent: () => import('./pages/blackjack/blackjack.component').then(m => m.BlackjackComponent)
  },
  {
    path: 'slot',
    canActivate: [authGuard, mayorDeEdadGuard],
    loadComponent: () => import('./pages/slot/slot.component').then(m => m.SlotComponent)
  },
  {
    path: 'ruleta',
    canActivate: [authGuard, mayorDeEdadGuard],
    loadComponent: () => import('./pages/ruleta/ruleta.component').then(m => m.RuletaComponent)
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
