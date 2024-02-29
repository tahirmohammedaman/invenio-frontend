import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, map, of } from 'rxjs';
import { ModalComponent } from 'src/app/_metronic/partials';
import { BaseUrl } from 'src/app/services/base-url';
import { Customer } from 'src/app/services/customer/customer';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { Product } from 'src/app/services/product/product';
import { ProductService } from 'src/app/services/product/product.service';
import { SaleOrder } from 'src/app/services/sale-order/sale-order';
import { SaleOrderService } from 'src/app/services/sale-order/sale-order.service';
import { Warehouse } from 'src/app/services/warehouse/warehouse';
import { WarehouseService } from 'src/app/services/warehouse/warehouse.service';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ToastService } from 'src/app/_metronic/layout/ngb-toast/toast.service';

@Component({
  selector: 'app-sale-orders',
  templateUrl: './sale-orders.component.html',
  styleUrls: ['./sale-orders.component.scss']
})
export class SaleOrdersComponent {
  page = 1;
  perPage = 5;
  searchKey$?: Observable<string>;

  saleOrders$: Observable<SaleOrder[]>;
  products$: Observable<Product[]>;
  customers$: Observable<Customer[]>;
  warehouses$: Observable<Warehouse[]>;

  totalCount$: Observable<number>;

  staticUrl = BaseUrl.url + '/static/';

  @ViewChild('orderModal') private orderModal: ModalComponent;

  orderModalConfig = {
    modalTitle: 'Add Sale Order Information'
  }

  addSaleOrderForm: FormGroup;

  constructor(
    private saleOrderService: SaleOrderService,
    private productService: ProductService,
    private customerService: CustomerService,
    private warehouseService: WarehouseService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    this.addSaleOrderForm = this.formBuilder.group({
      ProductId: ['', [Validators.required]],
      CustomerId: ['', [Validators.required]],
      WarehouseId: ['', [Validators.required]],
      Quantity: ['', [Validators.required]],
      Price: ['', [Validators.required]],
      OrderDate: [],
      DeliveryAddress: ['', [Validators.required]]
    });

    this.addSaleOrderForm.get('Quantity')?.valueChanges.subscribe((quantity) => {
      this.products$?.subscribe((products) => {
        const product = products.find((product) => product.ProductId === this.addSaleOrderForm.get('ProductId')?.value);
        if (product) {
          const totalPrice = (quantity * product.Price).toFixed(2);
          this.addSaleOrderForm.get('Price')?.setValue(totalPrice);
        }
      });
    });

    this.addSaleOrderForm.get('CustomerId')?.valueChanges.subscribe((customerId) => {
      this.customers$?.subscribe((customers) => {
        const customer = customers.find((customer) => customer.CustomerId === customerId);
        this.addSaleOrderForm.get('DeliveryAddress')?.setValue(customer?.DeliveryAddress);
      });
    });
  }

  ngOnInit(): void {
    this.updatePage(this.page, this.perPage);
    this.products$ = this.productService.getProducts().pipe(map(res => res.value));
    this.warehouses$ = this.warehouseService.getWarehouses().pipe(map(res => res.value));
    this.customers$ = this.customerService.getCustomers().pipe(map(res => res.value));
  }

  updatePage(page: number, perPage: number, searchKey?: string) {
    this.page = Math.ceil(page);
    this.perPage = perPage;

    this.saleOrders$ =
      this.saleOrderService.getSaleOrders(this.page, this.perPage, searchKey).pipe(map(res => {
        this.totalCount$ = of(res['@odata.count']);
        return res.value;
      }));
    this.cdr.detectChanges();
  }

  openOrderModal() {
    this.orderModal.open();
  }

  closeOrderModal() {
    this.orderModal.close();
    this.addSaleOrderForm.reset();
  }

  validateOrderForm(controlName: string): string {
    if (this.addSaleOrderForm.get(controlName)?.touched && this.addSaleOrderForm.get(controlName)?.hasError('required')) {
      return 'This field is required';
    }
    return '';
  }

  async addSaleOrder() {
    const formData = new FormData();
    Object.keys(this.addSaleOrderForm.controls).forEach(key => {
      if (this.addSaleOrderForm.value[key]) {
        if (key === 'OrderDate')
          formData.append(key, new Date(this.addSaleOrderForm.value[key]).toISOString());
        else
          formData.append(key, this.addSaleOrderForm.value[key]);
      }
    });

    this.saleOrderService.addSaleOrder(formData).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Sale order created successfully');
      },
      error: () => this.toastService.showError('An error occurred while adding sale order')
    });
    await this.orderModal.close();
  }

  async deleteSaleOrder(id: string) {
    this.saleOrderService.deleteSaleOrder(id).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Sale order cancelled successfully');
      },
      error: () => this.toastService.showError('An error occurred while cancelling sale order')
    });
  }

  searchSaleOrders(searchKey: string) {
    this.searchKey$ = of(searchKey);
    
    this.searchKey$.pipe(
      debounceTime(300),
      distinctUntilChanged())
      .subscribe(key => this.updatePage(1, this.perPage, key));
  }

  exportToExcel() {
    this.saleOrderService.getSaleOrders().subscribe((response) => {
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
      FileSaver.saveAs(data, 'sale-orders-' + currentDateTime + '.xlsx');
    });
  }

}
