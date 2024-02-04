import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuppliersComponent } from './suppliers.component';
import { RouterModule } from '@angular/router';
import { InlineSVGModule } from 'ng-inline-svg-2';



@NgModule({
  declarations: [
    SuppliersComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SuppliersComponent,
      },
    ]),
    InlineSVGModule,
  ]
})
export class SuppliersModule { }
