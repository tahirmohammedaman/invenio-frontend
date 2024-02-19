import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, map, of } from 'rxjs';
import { ModalComponent } from 'src/app/_metronic/partials';
import { Product } from 'src/app/services/product/product';
import { ProductService } from 'src/app/services/product/product.service';
import { Stock } from 'src/app/services/stock/stock';
import { StockService } from 'src/app/services/stock/stock.service';
import { Warehouse } from 'src/app/services/warehouse/warehouse';
import { WarehouseService } from 'src/app/services/warehouse/warehouse.service';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { BaseUrl } from 'src/app/services/base-url';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.scss']
})
export class StocksComponent {
  page = 1;
  perPage = 5;
  searchKey$?: Observable<string>;

  stocks$: Observable<Stock[]>;
  products$: Observable<Product[]>;
  warehouses$: Observable<Warehouse[]>;

  totalCount$: Observable<number>;
  selectedStock: Stock;

  staticUrl = BaseUrl.url + '/static/';

  @ViewChild('addStockModal') private addStockModal: ModalComponent;
  @ViewChild('editStockModal') private editStockModal: ModalComponent;

  addStockModalConfig = {
    modalTitle: 'Add Stock Information'
  }

  editStockModalConfig = {
    modalTitle: 'Edit Stock Information'
  }

  addStockForm: FormGroup;
  editStockForm: FormGroup;

  constructor(
    private stockService: StockService,
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef
  ) {

    this.addStockForm = this.formBuilder.group({
      ProductId: ['', [Validators.required]],
      WarehouseId: ['', [Validators.required]],
      StockQuantity: ['', [Validators.required]],
      LowStockThreshold: ['', [Validators.required]],
      QuantityPerUnit: [''],
      Sku: ['']
    });

    this.editStockForm = this.formBuilder.group({
      ProductId: [{ value: '', disabled: true }, [Validators.required]],
      WarehouseId: ['', [Validators.required]],
      StockQuantity: ['', [Validators.required]],
      LowStockThreshold: ['', [Validators.required]],
      QuantityPerUnit: ['', [Validators.required]],
      Sku: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.updatePage(this.page, this.perPage);
    this.products$ =
      this.productService.getProducts().pipe(map(response => response.value));
    this.warehouses$ =
      this.warehouseService.getWarehouses().pipe(map(response => response.value));
  }

  updatePage(page: number, perPage: number, searchKey?: string) {
    this.page = Math.ceil(page);
    this.perPage = perPage;

    this.stocks$ =
      this.stockService.getStocks(this.page, this.perPage, searchKey).pipe(map(response => {
        this.totalCount$ = of(response['@odata.count']);
        return response.value;
      }));
    this.changeDetector.detectChanges();
  }

  async openAddStockModal() {
    await this.addStockModal.open();
  }

  async closeAddStockModal() {
    await this.addStockModal.close();
  }

  async openEditStockModal(stock: Stock) {
    this.editStockForm.patchValue({
      ProductId: stock.Product.ProductId,
      WarehouseId: stock.Warehouse.WarehouseId,
      StockQuantity: stock.StockQuantity,
      LowStockThreshold: stock.LowStockThreshold,
      QuantityPerUnit: stock.QuantityPerUnit,
      Sku: stock.Sku
    });

    this.selectedStock = stock;
    await this.editStockModal.open();
  }

  async closeEditStockModal() {
    await this.editStockModal.close();
  }

  validateInput(form: FormGroup, controlName: string): string {
    if (form.get(controlName)?.touched && form.get(controlName)?.errors?.required) {
      return 'This field is required';
    }
    return '';
  }

  async addStock() {
    const formData = new FormData();
    Object.keys(this.addStockForm.value).forEach(key => {
      if (key)
        formData.append(key, this.addStockForm.value[key]);
    });

    this.stockService.addStock(formData).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });
    await this.closeAddStockModal();
  }

  async editStock() {
    const formData = new FormData();
    Object.keys(this.editStockForm.value).forEach(key => {
      if (key)
        formData.append(key, this.editStockForm.value[key] || '');
    });

    this.stockService.editStock(this.selectedStock.StockId, formData).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });
    await this.closeEditStockModal();
  }

  async deleteStock(stockId: string) {
    this.stockService.deleteStock(stockId).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });
  }

  searchStocks(searchKey: string) {
    this.searchKey$ = of(searchKey);

    this.searchKey$.pipe(
      debounceTime(300),
      distinctUntilChanged())
      .subscribe(key => this.updatePage(this.page, this.perPage, key));
  }

  exportToExcel() {
    this.stockService.getStocks().subscribe((response) => {
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
      FileSaver.saveAs(data, 'stocks-' + currentDateTime + '.xlsx');
    });
  }

}
