import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomOrders } from './custom-orders';

describe('CustomOrders', () => {
  let component: CustomOrders;
  let fixture: ComponentFixture<CustomOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomOrders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomOrders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
