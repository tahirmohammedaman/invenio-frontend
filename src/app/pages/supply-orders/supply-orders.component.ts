import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, debounce, debounceTime, distinctUntilChanged, map, of } from 'rxjs';
import { ModalComponent } from 'src/app/_metronic/partials';
import { Product } from 'src/app/services/product/product';
import { ProductService } from 'src/app/services/product/product.service';
import { SupplyOrder } from 'src/app/services/supply-order/supply-order';
import { SupplyOrderService } from 'src/app/services/supply-order/supply-order.service';
import { Supply } from 'src/app/services/supply/supply';
import { SupplyService } from 'src/app/services/supply/supply.service';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Warehouse } from 'src/app/services/warehouse/warehouse';
import { WarehouseService } from 'src/app/services/warehouse/warehouse.service';
import { BaseUrl } from 'src/app/services/base-url';
import { ToastService } from 'src/app/_metronic/layout/ngb-toast/toast.service';

@Component({
  selector: 'app-supply-orders',
  templateUrl: './supply-orders.component.html',
  styleUrls: ['./supply-orders.component.scss']
})
export class SupplyOrdersComponent implements OnInit {
  page = 1;
  perPage = 5;
  searchKey$?: Observable<string>;

  supplyOrders$: Observable<SupplyOrder[]>;
  supplies$: Observable<Supply[]>;
  products$: Observable<Product[]>;
  warehouses$: Observable<Warehouse[]>;

  totalCount$: Observable<number>;

  staticUrl = BaseUrl.url + '/static/';

  @ViewChild('addSupplyOrderModal') private addSupplyOrderModal: ModalComponent;

  addSupplyOrderModalConfig = {
    modalTitle: 'Add Supply Order Information'
  }

  addSupplyOrderForm: FormGroup;

  constructor(
    private supplyOrderService: SupplyOrderService,
    private supplyService: SupplyService,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private warehouseService: WarehouseService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {

    this.addSupplyOrderForm = this.formBuilder.group({
      ProductId: ['', [Validators.required]],
      SupplyId: [{ value: '', disabled: true }, [Validators.required]],
      WarehouseId: ['', [Validators.required]],
      Quantity: ['', [Validators.required]],
      Price: [{ value: '', disabled: true }, [Validators.required]],
      OrderDate: [],
      DeliveryDate: []
    });

    this.addSupplyOrderForm.get('ProductId')?.valueChanges.subscribe(productId => {
      this.supplies$ = this.supplyService.getSuppliesForProduct(productId).pipe(map(res => res.value));
      this.addSupplyOrderForm.get('SupplyId')?.enable();
    });

    this.addSupplyOrderForm.get('SupplyId')?.valueChanges.subscribe(supplyId => {
      this.supplies$?.subscribe(
        supplies => {
          const supply = supplies.find(supply => supply.SupplyId === supplyId);
          this.addSupplyOrderForm.get('Price')?.setValue(supply?.Price);
          this.addSupplyOrderForm.get('Price')?.enable();
        }
      );
    });

  }

  ngOnInit(): void {
    this.updatePage(this.page, this.perPage);
    this.products$ = this.productService.getProducts().pipe(map(res => res.value));
    this.warehouses$ = this.warehouseService.getWarehouses().pipe(map(res => res.value));
  }

  updatePage(page: number, perPage: number, searchKey?: string) {

    this.page = Math.ceil(page);
    this.perPage = perPage;

    this.supplyOrders$ =
      this.supplyOrderService.getSupplyOrders(page, perPage, searchKey).pipe(map(res => {
        this.totalCount$ = of(res['@odata.count']);
        return res.value;
      }));
    this.cdr.detectChanges();
  }

  openAddSupplyOrderModal() {
    this.addSupplyOrderModal.open();
  }

  closeAddSupplyOrderModal() {
    this.addSupplyOrderModal.close();
    this.addSupplyOrderForm.reset();
  }

  validateInput(form: FormGroup, controlName: string): string {
    if (form.get(controlName)?.touched && form.get(controlName)?.errors?.required) {
      return 'This field is required';
    }
    return '';
  }

  checkOverdue(deliveryDate: Date) {
    return new Date(deliveryDate) > new Date();
  }

  async addSupplyOrder() {
    const formData = new FormData();
    Object.keys(this.addSupplyOrderForm.value).forEach(key => {
      if (this.addSupplyOrderForm.value[key]) {
        if (key === 'OrderDate' || key === 'DeliveryDate')
          formData.append(key, new Date(this.addSupplyOrderForm.value[key]).toISOString());
        else
          formData.append(key, this.addSupplyOrderForm.value[key]);
      }
    });

    this.supplyOrderService.addSupplyOrder(formData).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Supply order created successfully');
      },
      error: () => this.toastService.showError('An error occurred while creating supply order')
    });
    await this.addSupplyOrderModal.close();
  }

  async deleteSupplyOrder(id: string) {
    this.supplyOrderService.deleteSupplyOrder(id).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Supply order cancelled successfully');
      },
      error: () => this.toastService.showError('An error occurred while cancelling supply order')
    });
  }

  searchSupplyOrders(searchKey: string) {
    this.searchKey$ = of(searchKey);

    this.searchKey$.pipe(
      debounceTime(300),
      distinctUntilChanged())
      .subscribe(key => this.updatePage(this.page, this.perPage, key));
  }

  markSupplyOrdersAsDeliveredAndUpdateStock(id: string) {
    this.supplyOrderService.markSupplyOrderAsDeliveredAndUpdateStock(id).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Supply order marked as delivered successfully');
      },
      error: () => this.toastService.showError('An error occurred while updating supply order')
    });
  }

  exportToExcel() {
    this.supplyOrderService.getSupplyOrders().subscribe((response) => {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.value);
      const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      const data: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const currentDateTime = new Date()
        .toISOString()
        .replace(/:/g, '-')
        .replace(/T/g, '_')
        .replace(/\.\d{3}Z/, '');
      FileSaver.saveAs(data, 'supply-orders-' + currentDateTime + '.xlsx');
    });
  }

}
