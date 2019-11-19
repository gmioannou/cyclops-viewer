import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModelPageAddFeaturePage } from './model-page-add-feature.page';

const routes: Routes = [
  {
    path: '',
    component: ModelPageAddFeaturePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelPageAddFeaturePageRoutingModule {}
