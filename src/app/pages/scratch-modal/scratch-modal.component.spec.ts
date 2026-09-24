import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScratchModalComponent } from './scratch-modal.component';

describe('ScratchModalComponent', () => {
  let component: ScratchModalComponent;
  let fixture: ComponentFixture<ScratchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScratchModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScratchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
