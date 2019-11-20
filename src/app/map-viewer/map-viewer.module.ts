import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MapViewerPageRoutingModule } from './map-viewer-routing.module';
import { MapViewerPage } from './map-viewer.page';
import { IonBottomDrawerModule } from 'ion-bottom-drawer';
import { EventFormComponent } from '../event-form/event-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapViewerPageRoutingModule,
    IonBottomDrawerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [MapViewerPage, EventFormComponent],
  entryComponents: [
    EventFormComponent
  ]
})
export class MapViewerPageModule { }
