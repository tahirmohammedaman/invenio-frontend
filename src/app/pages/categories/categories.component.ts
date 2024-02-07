import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, debounce, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { ModalComponent } from 'src/app/_metronic/partials';
import { Category } from 'src/app/services/category/category';
import { CategoryService } from 'src/app/services/category/category.service';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  page = 1;
  perPage = 5;
  searchKey$?: Observable<string>;

  categories$: Observable<Category[]>;
  totalCount$: Observable<number>;
  selectedCategory: Category;

  @ViewChild('addModal') private addModal: ModalComponent;
  @ViewChild('editModal') private editModal: ModalComponent;

  addModalConfig = {
    modalTitle: 'Add Category Information'
  }

  editModalConfig = {
    modalTitle: 'Edit Category Information'
  }

  addCategoryForm: FormGroup;
  editCategoryForm: FormGroup;

  constructor(
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef
  ) {

    this.addCategoryForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      Image: [''],
      Description: [''],
      ParentCategoryId: ['']
    });

    this.editCategoryForm = this.formBuilder.group({
      Name: ['', [Validators.required]],
      Image: [''],
      Description: [''],
      ParentCategoryId: ['']
    });
  }

  ngOnInit(): void {
    this.updatePage(this.page, this.perPage);
  }

  updatePage(page: number, perPage: number, searchKey?: string) {
    this.page = Math.ceil(page);
    this.perPage = perPage;

    this.categories$ =
      this.categoryService.getCategories(this.page, this.perPage, searchKey).pipe(map(response => {
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
    this.addCategoryForm.reset();
  }

  async openEditModal(category: Category) {
    this.editCategoryForm.patchValue({
      Name: category.Name,
      Description: category.Description,
      ParentCategoryId: category.ParentCategory?.CategoryId
    });

    this.selectedCategory = category;
    await this.editModal.open();
  }

  async closeEditModal() {
    await this.editModal.close();
  }

  onImageSelected(event: Event, form: FormGroup) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    form.patchValue({
      Image: file
    });
  }

  validateInput(form: FormGroup, controlName: string): string {
    if (form.get(controlName)?.touched && form.get(controlName)?.errors?.required) {
      return 'This field is required';
    }
    return '';
  }

  async addCategory() {
    const formData = new FormData();
    Object.keys(this.addCategoryForm.value).forEach(key => {
      if (key)
        formData.append(key, this.addCategoryForm.value[key]);
    });

    this.categoryService.addCategory(formData).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });
    await this.addModal.close();
  }

  async editCategory() {
    const formData = new FormData();
    Object.keys(this.editCategoryForm.value).forEach(key => {
      formData.append(key, this.editCategoryForm.value[key] || '');
    });

    this.categoryService.editCategory(this.selectedCategory.CategoryId, formData).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });

    await this.editModal.close();
  }

  async deleteCategory(id: string) {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => this.updatePage(this.page, this.perPage)
    });
  }

  searchCategories(searchKey: string) {
    this.searchKey$ = of(searchKey);

    this.searchKey$.pipe(
      debounceTime(300),        // Debounce for 300ms to reduce unnecessary calls
      distinctUntilChanged())   // Only proceed if the search key has changed
      .subscribe(key => this.updatePage(1, this.perPage, key));
  }


  exportToExcel() {
    this.categoryService.getCategories().subscribe((response) => {
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
      FileSaver.saveAs(data, 'categories-' + currentDateTime + '.xlsx');
    });
  }

}
