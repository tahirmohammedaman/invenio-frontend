import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DropdownMenusModule, WidgetsModule } from '../../_metronic/partials';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      },
    ]),
    WidgetsModule,
    InlineSVGModule,
    DropdownMenusModule
  ],
})
export class DashboardModule {}
