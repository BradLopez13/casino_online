import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scratch-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scratch-modal.component.html',
  styleUrls: ['./scratch-modal.component.scss']
})
export class ScratchModalComponent implements AfterViewInit, OnDestroy {
  @Input() rascado = true;
  @Input() cantidadGanada = 0;
  @Output() cerrar = new EventEmitter<void>();

  @ViewChild('scratchCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('primario') primario?: ElementRef<HTMLButtonElement>;

  /** Verdadero cuando la lámina ha desaparecido, a mano o con el botón. */
  revelado = false;

  /** Número de serie decorativo del boleto. */
  readonly serie = Math.floor(100000 + Math.random() * 900000).toString();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.pintarLamina(canvas);
    this.ctx.globalCompositeOperation = 'destination-out';

    canvas.addEventListener('mousedown', this.startDrawing);
    canvas.addEventListener('mousemove', this.draw);
    canvas.addEventListener('mouseup', this.stopDrawing);
    canvas.addEventListener('mouseleave', this.stopDrawing);

    canvas.addEventListener('touchstart', this.startDrawing, { passive: false });
    canvas.addEventListener('touchmove', this.draw, { passive: false });
    canvas.addEventListener('touchend', this.stopDrawing);

    requestAnimationFrame(() => this.primario?.nativeElement.focus());
  }

  ngOnDestroy() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    canvas.removeEventListener('mousedown', this.startDrawing);
    canvas.removeEventListener('mousemove', this.draw);
    canvas.removeEventListener('mouseup', this.stopDrawing);
    canvas.removeEventListener('mouseleave', this.stopDrawing);
    canvas.removeEventListener('touchstart', this.startDrawing);
    canvas.removeEventListener('touchmove', this.draw);
    canvas.removeEventListener('touchend', this.stopDrawing);
  }

  /** Lámina plateada con rayado diagonal y la leyenda «rasca aquí». */
  private pintarLamina(canvas: HTMLCanvasElement) {
    const { width, height } = canvas;
    const ctx = this.ctx;

    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, '#b8b1a3');
    base.addColorStop(0.5, '#d9d3c6');
    base.addColorStop(1, '#a9a295');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    for (let x = -height; x < width; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(20,18,12,0.55)';
    ctx.font = '600 11px "Geist Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R A S C A   A Q U Í', width / 2, height / 2);
  }

  startDrawing = (event: MouseEvent | TouchEvent) => {
    if ('touches' in event) event.preventDefault();
    this.isDrawing = true;
    this.draw(event);
  };

  stopDrawing = () => {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.checkIfRasgado();
  };

  draw = (event: MouseEvent | TouchEvent) => {
    if (!this.isDrawing) return;
    if ('touches' in event) event.preventDefault();

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    // El lienzo puede mostrarse escalado: se corrige la coordenada al tamaño interno.
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const x = (clientX - rect.left) * escalaX;
    const y = (clientY - rect.top) * escalaY;

    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, Math.PI * 2);
    this.ctx.fill();
  };

  checkIfRasgado() {
    const canvas = this.canvasRef.nativeElement;
    const pixels = this.ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }

    const porcentaje = transparent / (canvas.width * canvas.height) * 100;
    if (porcentaje > 50) {
      this.revelar();
    }
  }

  /** Retira la lámina de golpe. Es la alternativa accesible al gesto de rascar. */
  revelar() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.revelado = true;
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
