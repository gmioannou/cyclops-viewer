import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapViewerPage } from './map-viewer.page';

const routes: Routes = [
  {
    path: '',
    component: MapViewerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapViewerPageRoutingModule {}
