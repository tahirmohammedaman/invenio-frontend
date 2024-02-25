import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
	toasts: any[] = [];

	// show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
	// 	this.toasts.push({ textOrTpl, ...options });
	// }

  showSuccess(text: string) {
    this.toasts.push({ classname: 'bg-success', header: 'Success', text });
  }

  showError(text: string) {
    this.toasts.push({ classname: 'bg-danger', header: 'Error', text });
  }

	remove(toast: any) {
		this.toasts = this.toasts.filter((t) => t !== toast);
	}

	clear() {
		this.toasts.splice(0, this.toasts.length);
	}
}