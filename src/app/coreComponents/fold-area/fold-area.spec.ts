import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoldArea } from './fold-area';

describe('FoldArea', () => {
  let component: FoldArea;
  let fixture: ComponentFixture<FoldArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoldArea]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoldArea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
