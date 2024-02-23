import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrl } from 'src/app/services/base-url';
import { DashboardDto } from 'src/app/services/dashboard/dashboard';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  dashboardData$: Observable<DashboardDto>;

  staticUrl = `${BaseUrl.url}/static/`;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardData$ = this.dashboardService.getDashboardData();
  }
}
