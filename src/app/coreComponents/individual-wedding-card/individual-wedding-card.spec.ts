import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualWeddingCard } from './individual-wedding-card';

describe('IndividualWeddingCard', () => {
  let component: IndividualWeddingCard;
  let fixture: ComponentFixture<IndividualWeddingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndividualWeddingCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndividualWeddingCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
