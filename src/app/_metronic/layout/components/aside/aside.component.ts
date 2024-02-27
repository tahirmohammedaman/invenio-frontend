import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationCancel, NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription, from, map, of } from 'rxjs';
import { LayoutService } from '../../core/layout.service';
import { environment } from './../../../../../environments/environment';
import {
  MenuComponent,
  DrawerComponent,
  ToggleComponent,
  ScrollComponent,
} from '../../../kt/components';
import { AuthService } from 'src/app/modules/auth';
import { BaseUrl } from 'src/app/services/base-url';
import { AuthModel } from 'src/app/modules/auth/models/auth.model';
@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss'],
})
export class AsideComponent implements OnInit, OnDestroy {
  asideTheme: string = '';
  asideMinimize: boolean = false;
  asideMenuCSSClasses: string = '';
  appPreviewDocsUrl: string = environment.appPreviewDocsUrl;
  @ViewChild('ktAsideScroll', { static: true }) ktAsideScroll: ElementRef;
  private unsubscribe: Subscription[] = [];

  // USER INFO
  user$: Observable<AuthModel>;
  baseUrl = `${BaseUrl.url}` + '/static/';

  constructor(
    private layout: LayoutService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.asideTheme = this.layout.getProp('aside.theme') as string;
    this.asideMinimize = this.layout.getProp('aside.minimize') as boolean;
    this.asideMenuCSSClasses = this.layout.getStringCSSClasses('asideMenu');

    this.routingChanges();
    this.getUserFromLocalStorage();
  }

  getUserFromLocalStorage() {
    this.user$ = of(localStorage.getItem('authToken') ? JSON.parse(localStorage.getItem('authToken') || '') : '');
  }

  routingChanges() {
    const routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.menuReinitialization();
      }
    });
    this.unsubscribe.push(routerSubscription);
  }

  menuReinitialization() {
    setTimeout(() => {
      MenuComponent.reinitialization();
      DrawerComponent.reinitialization();
      ToggleComponent.reinitialization();
      ScrollComponent.reinitialization();
      if (this.ktAsideScroll && this.ktAsideScroll.nativeElement) {
        this.ktAsideScroll.nativeElement.scrollTop = 0;
      }
    }, 50);
  }

  logout() {
    window.location.pathname = "/auth/logout";
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
