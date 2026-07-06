import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentList } from './current-list';

describe('CurrentList', () => {
  let component: CurrentList;
  let fixture: ComponentFixture<CurrentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
