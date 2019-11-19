import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'map-viewer', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  {
    path: 'map-viewer',
    loadChildren: () => import('./map-viewer/map-viewer.module').then( m => m.MapViewerPageModule)
  },
  {
    path: 'model-page-add-feature',
    loadChildren: () => import('./model-page-add-feature/model-page-add-feature.module').then( m => m.ModelPageAddFeaturePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
