import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';
import { PageInfoService, PageLink } from 'src/app/_metronic/layout';
import { ToastService } from 'src/app/_metronic/layout/ngb-toast/toast.service';
import { ModalComponent } from 'src/app/_metronic/partials';
import { BaseUrl } from 'src/app/services/base-url';
import { Product } from 'src/app/services/product/product';
import { ProductService } from 'src/app/services/product/product.service';
import { Supplier } from 'src/app/services/supplier/supplier';
import { SupplierService } from 'src/app/services/supplier/supplier.service';
import { Supply } from 'src/app/services/supply/supply';
import { SupplyService } from 'src/app/services/supply/supply.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  selectedProduct$: Observable<Product>;
  supplies$: Observable<Supply[]>;
  suppliers$: Observable<Supplier[]>;

  links: PageLink[] = [
    {
      title: 'Products',
      path: '/products',
      isActive: false
    }
  ]

  staticUrl = BaseUrl.url + '/static/';

  @ViewChild('addSupplyModal') private addSupplyModal: ModalComponent;
  @ViewChild('editSupplyModal') private editSupplyModal: ModalComponent;

  addSupplyModalConfig = {
    modalTitle: 'Add Supply Information'
  }

  editSupplyModalConfig = {
    modalTitle: 'Edit Supply Information'
  }

  addSupplyForm: FormGroup;
  editSupplyForm: FormGroup;

  constructor(
    private productService: ProductService,
    private supplyService: SupplyService,
    private supplierService: SupplierService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private pageInfo: PageInfoService,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {

    this.addSupplyForm = this.formBuilder.group({
      SupplierId: ['', [Validators.required]],
      Price: ['', [Validators.required]],
      SupplyLeadTime: [''],
      MinimumOrderQuantity: [''],
      MaximumOrderQuantity: [''],
      IsDefaultSupply: [false]
    });

    this.editSupplyForm = this.formBuilder.group({
      SupplierId: ['', [Validators.required]],
      Price: ['', [Validators.required]],
      SupplyLeadTime: [''],
      MinimumOrderQuantity: [''],
      MaximumOrderQuantity: [''],
      IsDefaultSupply: [false]
    });
  }

  ngOnInit(): void {
    this.getProduct();

    this.pageInfo.updateTitle('Product Details');
    this.pageInfo.updateBreadcrumbs(this.links);
  }

  getProduct() {
    const id = (this.route.snapshot.paramMap.get('id') as string);
    this.selectedProduct$ = this.productService.getProductById(id);

    this.supplies$ =
      this.supplyService.getSuppliesForProduct(id).pipe(map(res => res.value));
    this.suppliers$ =
      this.supplierService.getSuppliers().pipe(map(res => res.value));

    this.cdr.detectChanges();
  }

  async openAddSupplyModal() {
    await this.addSupplyModal.open();
  }

  async openEditSupplyModal() {
    await this.editSupplyModal.open();
  }

  async closeAddSupplyModal() {
    await this.addSupplyModal.close();
    this.addSupplyForm.reset();
  }

  async closeEditSupplyModal() {
    await this.editSupplyModal.close();
    this.editSupplyForm.reset();
  }

  validateInput(form: FormGroup, controlName: string): string {
    if (form.get(controlName)?.touched && form.get(controlName)?.errors?.required) {
      return 'This field is required';
    }
    return '';
  }

  async addSupply() {
    const formData = new FormData();
    Object.keys(this.addSupplyForm.value).forEach(key => {
      if (this.addSupplyForm.value[key] !== '' && this.addSupplyForm.value[key] !== null)
        formData.append(key, this.addSupplyForm.value[key]);
    });

    const productId = (this.route.snapshot.paramMap.get('id') as string);
    formData.append('ProductId', productId);

    this.supplyService.addSupply(formData).subscribe({
      next: () => {
        this.supplies$ =
          this.supplyService.getSuppliesForProduct(productId).pipe(map(res => res.value))
        this.toast.showSuccess('Supply added successfully');
        this.cdr.detectChanges();
      },
      error: () => this.toast.showError('An error occurred while adding supply')
    });

    await this.closeAddSupplyModal();
  }

  async deleteSupply(supplyId: string) {
    this.supplyService.deleteSupply(supplyId).subscribe({
      next: () => {
        const productId = (this.route.snapshot.paramMap.get('id') as string);
        this.supplies$ = this.supplyService.getSuppliesForProduct(productId).pipe(map(res => res.value));
        this.toast.showSuccess('Supply deleted successfully');
        this.cdr.detectChanges();
      },
      error: () => this.toast.showError('An error occurred while deleting supply')
    });
  }
}
