import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Supplier } from 'src/app/services/supplier/supplier';
import { SupplierService } from 'src/app/services/supplier/supplier.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent {

  suppliers$: Observable<Supplier[]>;

  constructor(private supplierService : SupplierService) { }

  ngOnInit(): void {
    this.suppliers$ = this.supplierService.getSuppliers();
  }
}
