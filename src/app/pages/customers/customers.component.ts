import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, map, of } from 'rxjs';
import { ModalComponent } from 'src/app/_metronic/partials';
import { BaseUrl } from 'src/app/services/base-url';
import { Customer } from 'src/app/services/customer/customer';
import { CustomerService } from 'src/app/services/customer/customer.service';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ToastService } from 'src/app/_metronic/layout/ngb-toast/toast.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent {

  page = 1;
  perPage = 5;
  searchKey$?: Observable<string>;

  customers$: Observable<Customer[]>;
  totalCount$: Observable<number>;
  selectedCustomer: Customer;

  staticUrl = BaseUrl.url + '/static/';

  @ViewChild('addModal') private addModal: ModalComponent;
  @ViewChild('editModal') private editModal: ModalComponent;

  addModalConfig = {
    modalTitle: 'Add Customer Information'
  }

  editModalConfig = {
    modalTitle: 'Edit Customer Information'
  }

  addCustomerForm: FormGroup;
  editCustomerForm: FormGroup;

  constructor(
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {

    this.addCustomerForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      Logo: [''],
      Country: ['', [Validators.required]],
      City: ['', [Validators.required]],
      DeliveryAddress: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      PrimaryPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d(?:\s*\d){8,}$/)]],
      SecondaryPhoneNumber: ['', [Validators.pattern(/^\d(?:\s*\d){8,}$/)]]
    });

    this.editCustomerForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      Logo: [''],
      Country: ['', [Validators.required]],
      City: ['', [Validators.required]],
      DeliveryAddress: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      PrimaryPhoneNumber: ['', [Validators.required, Validators.pattern(/^\d(?:\s*\d){8,}$/)]],
      SecondaryPhoneNumber: ['', [Validators.pattern(/^\d(?:\s*\d){8,}$/)]]
    });
  }

  ngOnInit(): void {
    this.updatePage(this.page, this.perPage);
  }

  updatePage(page: number, perPage: number, searchKey?: string) {
    this.page = Math.ceil(page);
    this.perPage = perPage;

    this.customers$ =
      this.customerService.getCustomers(this.page, this.perPage, searchKey).pipe(map(response => {
        this.totalCount$ = of(response["@odata.count"]);
        return response.value;
      }));
    this.cdr.detectChanges();
  }

  async openAddModal() {
    this.addModal.open();
  }

  async closeAddModal() {
    this.addModal.close();
    this.addCustomerForm.reset();
  }

  async openEditModal(customer: Customer) {
    this.editCustomerForm.patchValue({
      Name: customer.Name,
      Country: customer.Country,
      City: customer.City,
      DeliveryAddress: customer.DeliveryAddress,
      Email: customer.Email,
      PrimaryPhoneNumber: customer.PrimaryPhoneNumber,
      SecondaryPhoneNumber: customer.SecondaryPhoneNumber
    });

    this.selectedCustomer = customer;
    this.editModal.open();
  }

  async closeEditModal() {
    this.editModal.close();
  }

  onImageSelected(event: any, form: FormGroup) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    form.patchValue({
      Logo: file
    });
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

  async addCustomer() {
    const formData = new FormData();
    Object.keys(this.addCustomerForm.value).forEach(key => {
      if (key)
        formData.append(key, this.addCustomerForm.value[key]);
    });

    this.customerService.addCustomer(formData).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Customer added successfully');
      },
      error: () => this.toastService.showError('An error occurred while adding customer')
    });
    await this.addModal.close();
  }

  async editCustomer() {
    const formData = new FormData();
    Object.keys(this.editCustomerForm.value).forEach(key => {
      formData.append(key, this.editCustomerForm.value[key] || '');
    });

    this.customerService.editCustomer(this.selectedCustomer.CustomerId, formData).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Customer updated successfully');
      },
      error: () => this.toastService.showError('An error occurred while updating customer')
    });
    await this.editModal.close();
  }

  async deleteCustomer(id: string) {
    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Customer deleted successfully');
      },
      error: () => this.toastService.showError('An error occurred while deleting customer')
    });
  }

  searchCustomers(searchKey: string) {
    this.searchKey$ = of(searchKey);

    this.searchKey$.pipe(
      debounceTime(300),        // Debounce for 300ms to reduce unnecessary calls
      distinctUntilChanged())   // Only proceed if the search key has changed
      .subscribe(key => this.updatePage(1, this.perPage, key));
  }

  exportToExcel() {
    this.customerService.getCustomers().subscribe((response) => {
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
      FileSaver.saveAs(data, 'customers-' + currentDateTime + '.xlsx');
    });
  }

}