import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let i18n: I18nService;

  beforeEach(() => {
    localStorage.removeItem('meridiano.idioma');
    TestBed.configureTestingModule({});
    i18n = TestBed.inject(I18nService);
    i18n.cambiar('es');
  });

  it('traduce una clave anidada', () => {
    expect(i18n.t('header.salon')).toBe('Salón');
  });

  it('sustituye parámetros', () => {
    expect(i18n.t('home.abierta', { hora: '21:30' })).toBe('Mesa abierta · 21:30');
  });

  it('cambia de idioma al vuelo', () => {
    i18n.cambiar('en');
    expect(i18n.t('header.salon')).toBe('Salon');
  });

  it('formatea fichas con millares y plural en cada idioma', () => {
    expect(i18n.fichas(1000)).toBe('1.000 fichas');
    expect(i18n.fichas(1)).toBe('1 ficha');
    i18n.cambiar('en');
    expect(i18n.fichas(1000)).toBe('1,000 chips');
    expect(i18n.fichas(1)).toBe('1 chip');
  });

  it('solo devuelve la cifra cuando se pide sin unidad', () => {
    expect(i18n.fichas(2500, false)).toBe('2.500');
  });
});
