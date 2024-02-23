import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleOrdersComponent } from './sale-orders.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { ModalsModule } from 'src/app/_metronic/partials';

@NgModule({
  declarations: [
    SaleOrdersComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SaleOrdersComponent
      },
    ]),
    InlineSVGModule,
    ReactiveFormsModule,
    ModalsModule,
    NgSelectModule
  ]
})
export class SaleOrdersModule { }