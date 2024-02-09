import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StocksComponent } from './stocks.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { ModalsModule } from 'src/app/_metronic/partials';



@NgModule({
  declarations: [
    StocksComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: StocksComponent
      }
    ]),
    InlineSVGModule,
    ReactiveFormsModule,
    ModalsModule,
    NgSelectModule
  ]
})
export class StocksModule { }
