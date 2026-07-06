import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingCardsList } from './wedding-cards-list';

describe('WeddingCardsList', () => {
  let component: WeddingCardsList;
  let fixture: ComponentFixture<WeddingCardsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingCardsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeddingCardsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
