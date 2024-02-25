import { Component, TemplateRef } from '@angular/core';
import { ToastService } from './toast.service';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgbToastModule, NgIf, NgTemplateOutlet, NgFor],
  template: `
		<ngb-toast
			*ngFor="let toast of toastService.toasts"
      class="text-white"
			[class]="toast.classname"
      [header]="toast.header" 
			[autohide]="true"
			[delay]="toast.delay || 3000"
			(hidden)="toastService.remove(toast)"
		>
			<ng-template [ngIf]="isTemplate(toast)" [ngIfElse]="text">
				<ng-template [ngTemplateOutlet]="toast.textOrTpl"></ng-template>
			</ng-template>

      <ng-template #text>
        <span class="text-white" style="font-size: 13px;">{{ toast.text }}</span>
      </ng-template>
		</ngb-toast>
	`,
  host: { class: 'toast-container position-fixed top-0 end-0 p-3', style: 'z-index: 1200' },
})
export class ToastComponent {
  constructor(public toastService: ToastService) { }

  isTemplate(toast: any) {
    return toast.textOrTpl instanceof TemplateRef;
  }
}