import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, map, of } from 'rxjs';
import { PageInfoService } from 'src/app/_metronic/layout';
import { ToastService } from 'src/app/_metronic/layout/ngb-toast/toast.service';
import { ModalComponent } from 'src/app/_metronic/partials';
import { BaseUrl } from 'src/app/services/base-url';
import { User } from 'src/app/services/user/user';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  adminPage = 1;
  adminPerPage = 5;

  auditorPage = 1;
  auditorPerPage = 5;

  adminSearchKey$?: Observable<string>;
  auditorSearchKey$?: Observable<string>;

  admins$: Observable<User[]>;
  auditors$: Observable<User[]>;

  adminsCount$: Observable<number>;
  auditorsCount$: Observable<number>;

  staticUrl = BaseUrl.url + '/static/';

  @ViewChild('addAdminModal') private addAdminModal: ModalComponent;
  @ViewChild('addAuditorModal') private addAuditorModal: ModalComponent;

  addAdminModalConfig = {
    modalTitle: 'Add Admin User Information'
  }

  addAuditorModalConfig = {
    modalTitle: 'Add Auditor Information'
  }

  addAdminForm: FormGroup;
  addAuditorForm: FormGroup;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private toastService: ToastService,
    private pageInfoService: PageInfoService
  ) {

    this.addAdminForm = this.formBuilder.group({
      FirstName: ['', [Validators.required]],
      LastName: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      AutoGeneratePassword: [true],
      Password: [
        { value: '', disabled: true },
        [Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')]
      ],
      Image: [''],
      SendMail: [true]
    });

    this.addAuditorForm = this.formBuilder.group({
      FirstName: ['', [Validators.required]],
      LastName: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      AutoGeneratePassword: [true],
      Password: [
        { value: '', disabled: true },
        [Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})')]
      ],
      Image: [''],
      SendMail: [true]
    });
  }

  ngOnInit(): void {
    this.pageInfoService.updateTitle('Authorized Users');

    this.updateAdmins(this.adminPage, this.adminPerPage);
    this.updateAuditors(this.auditorPage, this.auditorPage);

    this.addAdminForm.get('AutoGeneratePassword')?.valueChanges.subscribe(bool => {
      if (bool) this.addAdminForm.get('Password')?.disable();
      else this.addAdminForm.get('Password')?.enable();
    });

    this.addAuditorForm.get('AutoGeneratePassword')?.valueChanges.subscribe(bool => {
      if (bool) this.addAuditorForm.get('Password')?.disable();
      else this.addAuditorForm.get('Password')?.enable();
    });
  }

  updateAdmins(page: number, perPage: number, searchKey?: string) {
    this.adminPage = Math.ceil(page);
    this.adminPerPage = perPage;

    this.admins$ =
      this.userService.getUsers('Admin', this.adminPage, this.adminPerPage, searchKey).pipe(map(res => {
        this.adminsCount$ = of(res["@odata.count"]);
        return res.value;
      }));
    this.changeDetector.detectChanges();
  }

  updateAuditors(page: number, perPage: number, searchKey?: string) {
    this.auditorPage = Math.ceil(page);
    this.auditorPerPage = perPage;

    this.auditors$ =
      this.userService.getUsers('Basic', this.auditorPage, this.auditorPerPage, searchKey).pipe(map(res => {
        this.auditorsCount$ = of(res["@odata.count"]);
        return res.value;
      }));
    this.changeDetector.detectChanges();
  }

  async openAddAdminModal() {
    await this.addAdminModal.open();
  }

  async closeAddAdminModal() {
    await this.addAdminModal.close();
    this.addAdminForm.reset();
  }

  async openAddAuditorModal() {
    await this.addAuditorModal.open();
  }

  async closeAddAuditorModal() {
    await this.addAuditorModal.close();
    this.addAuditorForm.reset();
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
    else if (form.get(controlName)?.touched && form.get(controlName)?.errors?.email) {
      return 'Invalid email address';
    }
    else if (form.get(controlName)?.touched && form.get(controlName)?.errors?.pattern) {
      return 'Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, and 1 number';
    }
    return '';
  }

  async addUser(form: FormGroup) {
    const formData = new FormData();
    Object.keys(form.value).forEach(key => {
      if (key === 'AutoGeneratePassword') { }
      else if (key === 'Password')
        if (form.value['AutoGeneratePassword']) { }
      if (form.value[key])
        formData.append(key, form.value[key]);
    });

    if (form === this.addAdminForm)
      formData.append('Role', 'Admin');
    else
      formData.append('Role', 'Basic');

    this.userService.registerUser(formData).subscribe({
      next: () => {
        this.toastService.showSuccess('Registered user successfully');
        if (form === this.addAdminForm) {
          this.updateAdmins(this.adminPage, this.adminPerPage);
          this.closeAddAdminModal();
        }
        else {
          this.updateAuditors(this.auditorPage, this.auditorPerPage);
          this.closeAddAuditorModal();
        }
      },
      error: () => this.toastService.showError('An error occurred while registering user')
    });
  }

  searchUsers(table: string, searchKey: string) {
    if (table === 'Admins') {
      this.adminSearchKey$ = of(searchKey);
      this.adminSearchKey$.pipe(
        debounceTime(300),        // Debounce for 300ms to reduce unnecessary calls
        distinctUntilChanged())   // Only proceed if the search key has changed
        .subscribe(key => this.updateAdmins(1, this.adminPerPage, key));
    }

    else {
      this.auditorSearchKey$ = of(searchKey);
      this.auditorSearchKey$.pipe(
        debounceTime(300),        // Debounce for 300ms to reduce unnecessary calls
        distinctUntilChanged())   // Only proceed if the search key has changed
        .subscribe(key => this.updateAuditors(1, this.auditorPerPage, key));
    }
  }
}
