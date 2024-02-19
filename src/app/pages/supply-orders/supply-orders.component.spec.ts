import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyOrdersComponent } from './supply-orders.component';

describe('SupplyOrdersComponent', () => {
  let component: SupplyOrdersComponent;
  let fixture: ComponentFixture<SupplyOrdersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplyOrdersComponent]
    });
    fixture = TestBed.createComponent(SupplyOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
