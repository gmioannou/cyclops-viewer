import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapViewerPageRoutingModule } from './map-viewer-routing.module';

import { MapViewerPage } from './map-viewer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapViewerPageRoutingModule
  ],
  declarations: [MapViewerPage]
})
export class MapViewerPageModule {}
