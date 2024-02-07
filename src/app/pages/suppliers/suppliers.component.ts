import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, map, of } from 'rxjs';
import { ModalComponent, ModalConfig } from 'src/app/_metronic/partials';
import { Supplier } from 'src/app/services/supplier/supplier';
import { SupplierService } from 'src/app/services/supplier/supplier.service';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {

  page = 1;
  perPage = 5;

  suppliers$: Observable<Supplier[]>;
  totalCount$: Observable<number>;
  selectedSupplier: Supplier;

  @ViewChild('addModal') private addModal: ModalComponent;
  @ViewChild('editModal') private editModal: ModalComponent;

  addModalConfig: ModalConfig = {
    modalTitle: 'Add Supplier Information'
  }

  editModalConfig: ModalConfig = {
    modalTitle: 'Edit Supplier Information'
  }

  addSupplierForm: FormGroup;
  editSupplierForm: FormGroup;

  constructor(
    private supplierService: SupplierService,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef
  ) {

    this.addSupplierForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      Email: ['', [Validators.required]],
      PrimaryPhoneNumber: ['', [Validators.required]],
      SecondaryPhoneNumber: [''],
      Country: ['', [Validators.required]],
      City: ['', [Validators.required]],
      Logo: [''],
      ManagerName: [''],
    });

    this.editSupplierForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      Email: ['', [Validators.required]],
      PrimaryPhoneNumber: ['', [Validators.required]],
      SecondaryPhoneNumber: [''],
      Country: ['', [Validators.required]],
      City: ['', [Validators.required]],
      Logo: [''],
      ManagerName: [''],
    });

  }

  ngOnInit(): void {
    this.updatePage(this.page, this.perPage);
  }

  updatePage(page: number, perPage: number) {
    this.page = page;
    this.perPage = perPage;

    this.suppliers$ =
      this.supplierService.getSuppliers(this.page, this.perPage).pipe(map(response => {
        this.totalCount$ = of(response["@odata.count"]);
        return response.value;
      }));
    this.changeDetector.detectChanges();
  }

  async openAddModal() {
    await this.addModal.open();
  }

  async closeAddModal() {
    await this.addModal.close();
  }

  async openEditModal(supplier: Supplier) {

    this.editSupplierForm.patchValue({
      Name: supplier.Name,
      Email: supplier.Email,
      PrimaryPhoneNumber: supplier.PrimaryPhoneNumber,
      SecondaryPhoneNumber: supplier.SecondaryPhoneNumber,
      Country: supplier.Country,
      City: supplier.City,
      ManagerName: supplier.ManagerName,
    });

    this.selectedSupplier = supplier;

    await this.editModal.open();
  }

  async closeEditModal() {
    await this.editModal.close();
  }

  onImageSelected(event: Event, form: FormGroup) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    form.patchValue({
      Logo: file
    });
  }

  async addSupplier() {
    const formData = new FormData();
    Object.keys(this.addSupplierForm.value).forEach(key => {
      if (key)
        formData.append(key, this.addSupplierForm.value[key]);
    });

    this.supplierService.addSupplier(formData).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });
    await this.closeAddModal();
  }

  async editSupplier() {
    const formData = new FormData();
    Object.keys(this.editSupplierForm.value).forEach(key => {
      formData.append(key, this.editSupplierForm.value[key] ? this.editSupplierForm.value[key] : '');
    });

    this.supplierService.editSupplier(this.selectedSupplier.SupplierId, formData).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });

    await this.closeEditModal();
  }

  async deleteSupplier(id: string) {
    this.supplierService.deleteSupplier(id).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });
  }

  exportToExcel() {
    this.supplierService.getSuppliers().subscribe(response => {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.value);
      const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      const data: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      });
      const currentDateTime = new Date()
        .toISOString()
        .replace(/:/g, '-')
        .replace(/T/g, '_')
        .replace(/\.\d{3}Z/, '');
      FileSaver.saveAs(data, 'suppliers-' + currentDateTime + '.xlsx');
    });
  }
}
