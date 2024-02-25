import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, map, of } from 'rxjs';
import { ModalComponent } from 'src/app/_metronic/partials';
import { Product } from 'src/app/services/product/product';
import { ProductService } from 'src/app/services/product/product.service';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { CategoryService } from 'src/app/services/category/category.service';
import { Category } from 'src/app/services/category/category';
import { BaseUrl } from 'src/app/services/base-url';
import { ToastService } from 'src/app/_metronic/layout/ngb-toast/toast.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  page = 1;
  perPage = 5;
  searchKey$?: Observable<string>;

  products$: Observable<Product[]>;
  categories$: Observable<Category[]>;

  totalCount$: Observable<number>;
  selectedProduct: Product;

  staticUrl = BaseUrl.url + '/static/';

  @ViewChild('addProductModal') private addProductModal: ModalComponent;
  @ViewChild('editProductModal') private editProductModal: ModalComponent;
  @ViewChild('detailProductModal') private detailProductModal: ModalComponent;

  addProductModalConfig = {
    modalTitle: 'Add Product Information'
  }

  editProductModalConfig = {
    modalTitle: 'Edit Product Information'
  }

  detailProductModalConfig = {
    modalTitle: 'Product Information'
  }

  addProductForm: FormGroup;
  editProductForm: FormGroup;
  detailProductForm: FormGroup;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private toastService: ToastService
  ) {

    this.addProductForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      ShortDescription: ['', [Validators.required]],
      Description: [''],
      CategoryId: ['', [Validators.required]],
      Price: ['', [Validators.required]],
      Images: ['', [Validators.required]],
      MinimumOrderQuantity: [''],
      MaximumOrderQuantity: ['']
    });

    this.editProductForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      ShortDescription: ['', [Validators.required]],
      Description: [''],
      CategoryId: ['', [Validators.required]],
      Price: ['', [Validators.required]],
      Images: ['', [Validators.required]],
      MinimumOrderQuantity: [''],
      MaximumOrderQuantity: ['']
    });
  }

  ngOnInit(): void {
    this.updatePage(this.page, this.perPage);
    this.categories$ =
      this.categoryService.getCategories().pipe(map(response => response.value));
  }

  updatePage(page: number, perPage: number, searchKey?: string) {
    this.page = Math.ceil(page);
    this.perPage = perPage;

    this.products$ =
      this.productService.getProducts(this.page, this.perPage, searchKey).pipe(map(response => {
        this.totalCount$ = of(response["@odata.count"]);
        return response.value;
      }));
    this.changeDetector.detectChanges();
  }

  async openAddProductModal() {
    await this.addProductModal.open();
  }

  async closeAddProductModal() {
    await this.addProductModal.close();
    this.addProductForm.reset();
  }

  async openEditProductModal(product: Product) {
    this.editProductForm.patchValue({
      Name: product.Name,
      ShortDescription: product.ShortDescription,
      Description: product.Description,
      CategoryId: product.Category?.CategoryId,
      Price: product.Price,
      MinimumOrderQuantity: product.MinimumOrderQuantity,
      MaximumOrderQuantity: product.MaximumOrderQuantity
    });

    this.selectedProduct = product;
    await this.editProductModal.open();
  }

  async closeEditProductModal() {
    await this.editProductModal.close();
    this.editProductForm.reset();
  }

  onImageSelected(event: Event, form: FormGroup) {
    const target = event.target as HTMLInputElement;
    const fileList: FileList = target.files as FileList;

    form.patchValue({
      Images: Array.from(fileList)
    });
  }

  validateInput(form: FormGroup, controlName: string): string {
    if (form.get(controlName)?.touched && form.get(controlName)?.errors?.required) {
      return 'This field is required';
    }
    return '';
  }

  async addProduct() {
    const formData = new FormData();
    Object.keys(this.addProductForm.value).forEach(key => {
      if (key == "Images") {
        const files = this.addProductForm.value[key];
        for (let i = 0; i < files.length; i++)
          formData.append('Images', files[i]);
      }
      else if (key)
        formData.append(key, this.addProductForm.value[key]);
    });

    this.productService.addProduct(formData).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Product added successfully');
      },
      error: () => this.toastService.showError('An error occurred while adding product')
    });
    await this.addProductModal.close();
  }

  async editProduct() {
    const formData = new FormData();
    Object.keys(this.editProductForm.value).forEach(key => {
      if (key == "Images") {
        const files = this.editProductForm.value[key];
        for (let i = 0; i < files.length; i++)
          formData.append('Images', files[i]);
      }
      else if (key)
        formData.append(key, this.editProductForm.value[key] || '');
    });

    this.productService.editProduct(this.selectedProduct.ProductId, formData).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Product updated successfully');
      },
      error: () => this.toastService.showError('An error occurred while updating product')
    });
    await this.editProductModal.close();
  }

  async deleteProduct(productId: string) {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.updatePage(this.page, this.perPage);
        this.toastService.showSuccess('Product deleted successfully');
      },
      error: () => this.toastService.showError('An error occurred while deleting product')
    });
  }

  searchProducts(searchKey: string) {
    this.searchKey$ = of(searchKey);

    this.searchKey$.pipe(
      debounceTime(300),
      distinctUntilChanged())
      .subscribe(key => this.updatePage(this.page, this.perPage, key));
  }

  exportToExcel() {
    this.productService.getProducts().subscribe((response) => {
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
      FileSaver.saveAs(data, 'products-' + currentDateTime + '.xlsx');
    });
  }
}