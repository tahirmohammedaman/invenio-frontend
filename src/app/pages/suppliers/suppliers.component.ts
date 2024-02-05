import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ModalComponent, ModalConfig } from 'src/app/_metronic/partials';
import { Supplier } from 'src/app/services/supplier/supplier';
import { SupplierService } from 'src/app/services/supplier/supplier.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent {

  suppliers$: Observable<Supplier[]>;
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
    private formBuilder: FormBuilder
  ) {

    this.addSupplierForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      Email: ['', [Validators.required]],
      PrimaryPhoneNumber: ['', [Validators.required]],
      SecondaryPhoneNumber: [''],
      Country: ['', [Validators.required]],
      City: ['', [Validators.required]],
      ManagerName: [''],
    });

    this.editSupplierForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      Email: ['', [Validators.required]],
      PrimaryPhoneNumber: ['', [Validators.required]],
      SecondaryPhoneNumber: [''],
      Country: ['', [Validators.required]],
      City: ['', [Validators.required]],
      ManagerName: [''],
    });

  }

  ngOnInit(): void {
    this.updatePage();
  }

  updatePage() {
    this.suppliers$ = this.supplierService.getSuppliers();
  }

  async openAddModal() {
    await this.addModal.open();
  }

  async closeAddModal() {
    await this.addModal.close();
  }

  async openEditModal(supplier: Supplier) {

    this.editSupplierForm.setValue({
      Name: supplier.name,
      Email: supplier.email,
      PrimaryPhoneNumber: supplier.primaryPhoneNumber,
      SecondaryPhoneNumber: supplier.secondaryPhoneNumber,
      Country: supplier.country,
      City: supplier.city,
      ManagerName: supplier.managerName,
    });

    this.selectedSupplier = supplier;

    await this.editModal.open();
  }

  async closeEditModal() {
    await this.editModal.close();
  }

  async addSupplier() {

    const formData = new FormData();

    Object.keys(this.addSupplierForm.value).forEach(key => {
      if (key)
        formData.append(key, this.addSupplierForm.value[key]);
    });

    await this.supplierService.addSupplier(formData)
      .subscribe(() => this.updatePage());
    await this.closeAddModal();
  }

  async editSupplier() {

    const formData = new FormData();

    Object.keys(this.editSupplierForm.value).forEach(key => {
      formData.append(key, this.editSupplierForm.value[key] ? this.editSupplierForm.value[key] : '');
    });

    await this.supplierService.editSupplier(this.selectedSupplier.supplierId, formData)
      .subscribe(() => this.updatePage());
    await this.closeEditModal();
  }

  async deleteSupplier(id: string) {
    await this.supplierService.deleteSupplier(id)
      .subscribe(() => this.updatePage());
  }
}
