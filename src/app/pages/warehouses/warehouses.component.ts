import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, debounce, debounceTime, distinctUntilChanged, map, of } from 'rxjs';
import { ModalComponent } from 'src/app/_metronic/partials';
import { Warehouse } from 'src/app/services/warehouse/warehouse';
import { WarehouseService } from 'src/app/services/warehouse/warehouse.service';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-warehouses',
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.scss']
})
export class WarehousesComponent {
  page = 1;
  perPage = 2;
  searchKey$?: Observable<string>;

  warehouses$: Observable<Warehouse[]>;
  totalCount$: Observable<number>;
  selectedWarehouse: Warehouse;

  @ViewChild('addModal') private addModal: ModalComponent;
  @ViewChild('editModal') private editModal: ModalComponent;

  addModalConfig = {
    modalTitle: 'Add Warehouse Information'
  }

  editModalConfig = {
    modalTitle: 'Edit Warehouse Information'
  }

  addWarehouseForm: FormGroup;
  editWarehouseForm: FormGroup;

  constructor(
    private warehouseService: WarehouseService,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef
  ) {

    this.addWarehouseForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      Country: ['', [Validators.required]],
      City: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      PhoneNumber: ['', [Validators.required, Validators.pattern(/^\d(?:\s*\d){8,}$/)]],
      Email: ['', [Validators.required, Validators.email]],
      Latitude: [''],
      Longitude: ['']
    });

    this.editWarehouseForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      Country: ['', [Validators.required]],
      City: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      PhoneNumber: ['', [Validators.required, Validators.pattern(/^\d(?:\s*\d){8,}$/)]],
      Email: ['', [Validators.required, Validators.email]],
      Latitude: [''],
      Longitude: ['']
    });
  }

  ngOnInit(): void {
    this.updatePage(this.page, this.perPage);
  }

  updatePage(page: number, perPage: number, searchKey?: string) {
    this.page = Math.ceil(page);
    this.perPage = perPage;

    this.warehouses$ =
      this.warehouseService.getWarehouses(this.page, this.perPage, searchKey).pipe(map(response => {
        this.totalCount$ = of(response["@odata.count"]);
        return response.value;
      }));
    this.changeDetector.detectChanges();
  }

  async openAddModal() {
    await this.addModal.open();
    this.addWarehouseForm.reset();
  }

  async closeAddModal() {
    await this.addModal.close();
  }

  async openEditModal(warehouse: Warehouse) {
    this.editWarehouseForm.patchValue({
      Name: warehouse.Name,
      Country: warehouse.Country,
      City: warehouse.City,
      Address: warehouse.Address,
      PhoneNumber: warehouse.PhoneNumber,
      Email: warehouse.Email,
      Latitude: warehouse.Latitude,
      Longitude: warehouse.Longitude
    });

    this.selectedWarehouse = warehouse;
    await this.editModal.open();
  }

  async closeEditModal() {
    await this.editModal.close();
  }

  validateInput(form: FormGroup, controlName: string): string {
    if (form.get(controlName)?.touched && form.get(controlName)?.errors?.required) {
      return 'This field is required';
    }
    if (form.get(controlName)?.touched && (form.get(controlName)?.errors?.pattern || form.get(controlName)?.errors?.email)) {
      return 'Invalid field format';
    }
    return '';
  }

  async addWarehouse() {
    const formData = new FormData();
    Object.keys(this.addWarehouseForm.value).forEach(key => {
      if (key)
        formData.append(key, this.addWarehouseForm.value[key]);
    });

    this.warehouseService.addWarehouse(formData).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });
    await this.addModal.close();
  }

  async editWarehouse() {
    const formData = new FormData();
    Object.keys(this.editWarehouseForm.value).forEach(key => {
      formData.append(key, this.editWarehouseForm.value[key] || '');
    });

    this.warehouseService.editWarehouse(this.selectedWarehouse.WarehouseId, formData).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });

    await this.editModal.close();
  }

  async deleteWarehouse(id: string) {
    this.warehouseService.deleteWarehouse(id).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });
  }

  searchWarehouses(searchKey: string) {
    this.searchKey$ = of(searchKey);

    this.searchKey$.pipe(
      debounceTime(300),
      distinctUntilChanged())
      .subscribe(key => this.updatePage(this.page, this.perPage, key));
  }

  exportToExcel() {
    this.warehouseService.getWarehouses().subscribe((response) => {
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
      FileSaver.saveAs(data, 'warehouses-' + currentDateTime + '.xlsx');
    });
  }
}
