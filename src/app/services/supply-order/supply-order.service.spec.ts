import { TestBed } from '@angular/core/testing';

import { SupplyOrderService } from './supply-order.service';

describe('SupplyOrderService', () => {
  let service: SupplyOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplyOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
