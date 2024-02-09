import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'suppliers',
    loadChildren: () =>
      import('./suppliers/suppliers.module').then((m) => m.SuppliersModule),
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./categories/categories.module').then((m) => m.CategoriesModule),
  },
  {
    path: 'warehouses',
    loadChildren: () =>
      import('./warehouses/warehouses.module').then((m) => m.WarehousesModule),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./products/products.module').then((m) => m.ProductsModule),
  },
  {
    path: 'stocks',
    loadChildren: () =>
      import('./stocks/stocks.module').then((m) => m.StocksModule),
  },
  // {
  //   path: 'supplies',
  //   loadChildren: () =>
  //     import('./supplies/supplies.module').then((m) => m.SuppliesModule),
  // },
  // {
  //   path: 'supply-orders',
  //   loadChildren: () =>
  //     import('./supply-orders/supply-orders.module').then((m) => m.SupplyOrdersModule),
  // },
  {
    path: 'builder',
    loadChildren: () =>
      import('./builder/builder.module').then((m) => m.BuilderModule),
  },
  {
    path: 'crafted/pages/profile',
    loadChildren: () =>
      import('../modules/profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    path: 'crafted/account',
    loadChildren: () =>
      import('../modules/account/account.module').then((m) => m.AccountModule),
  },
  {
    path: 'crafted/pages/wizards',
    loadChildren: () =>
      import('../modules/wizards/wizards.module').then((m) => m.WizardsModule),
  },
  {
    path: 'crafted/widgets',
    loadChildren: () =>
      import('../modules/widgets-examples/widgets-examples.module').then(
        (m) => m.WidgetsExamplesModule
      ),
  },
  {
    path: 'apps/chat',
    loadChildren: () =>
      import('../modules/apps/chat/chat.module').then((m) => m.ChatModule),
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
