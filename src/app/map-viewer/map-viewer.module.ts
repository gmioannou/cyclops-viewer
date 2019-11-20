import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapViewerPageRoutingModule } from './map-viewer-routing.module';

import { MapViewerPage } from './map-viewer.page';
import { IonBottomDrawerModule } from 'ion-bottom-drawer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapViewerPageRoutingModule,
    IonBottomDrawerModule
  ],
  declarations: [MapViewerPage]
})
export class MapViewerPageModule {}
