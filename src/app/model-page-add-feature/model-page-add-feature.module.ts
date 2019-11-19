import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModelPageAddFeaturePageRoutingModule } from './model-page-add-feature-routing.module';

import { ModelPageAddFeaturePage } from './model-page-add-feature.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModelPageAddFeaturePageRoutingModule
  ],
  declarations: [ModelPageAddFeaturePage]
})
export class ModelPageAddFeaturePageModule {}
