import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingCard } from './wedding-card';

describe('WeddingCard', () => {
  let component: WeddingCard;
  let fixture: ComponentFixture<WeddingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeddingCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
