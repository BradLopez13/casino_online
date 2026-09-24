import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scratch-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scratch-modal.component.html',
  styleUrls: ['./scratch-modal.component.scss']
})
export class ScratchModalComponent implements AfterViewInit {
  @Input() rascado = true;
  @Input() cantidadGanada = 0;
  @Output() cerrar = new EventEmitter<void>();

  @ViewChild('scratchCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ctx.globalCompositeOperation = 'destination-out';

    canvas.addEventListener('mousedown', this.startDrawing);
    canvas.addEventListener('mousemove', this.draw);
    canvas.addEventListener('mouseup', this.stopDrawing);
    canvas.addEventListener('mouseleave', this.stopDrawing);

    canvas.addEventListener('touchstart', this.startDrawing, { passive: false });
    canvas.addEventListener('touchmove', this.draw, { passive: false });
    canvas.addEventListener('touchend', this.stopDrawing);
  }

  startDrawing = (event: MouseEvent | TouchEvent) => {
    this.isDrawing = true;
    this.draw(event);
  };

  stopDrawing = () => {
    this.isDrawing = false;
    this.checkIfRasgado();
  };

  draw = (event: MouseEvent | TouchEvent) => {
    if (!this.isDrawing) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in event ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = 'touches' in event ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

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
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
