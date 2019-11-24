import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonBottomDrawerModule, DrawerState } from 'ion-bottom-drawer';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Plugins, CameraResultType, CameraSource, Geolocation, GeolocationOptions } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MapViewerService } from '../services/map-viewer.service';

@Component({
  selector: 'app-map-viewer',
  templateUrl: './map-viewer.page.html',
  styleUrls: ['./map-viewer.page.scss'],
})
export class MapViewerPage implements OnInit {
  @ViewChild("map", { static: false }) mapEl: ElementRef;

  drawerState = 0;
  dockedHeight = 400;

  photoList: any[] = []
  photoListPreview: SafeResourceUrl[] = [];

  mapView: any;
  featureLayerField: any
  featureLayerDomain: any

  constructor(
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private mapViewerService: MapViewerService) { }

  ngOnInit() {
    // get mapview
    this.mapViewerService.getMapView()
      .then(res => {
        this.mapView = res
        this.mapView.container = this.mapEl.nativeElement

        console.log('Mapview initialized...');
      })
      .catch(err => console.error(err))

    // get featurelayer descriptor
    this.mapViewerService.getFetureLayerDescriptor()
      .then(laydesc => {
        let renderer = laydesc.data.drawingInfo.renderer
        this.featureLayerField = renderer.field1
        this.featureLayerDomain = renderer.uniqueValueInfos

        console.log('Layer descriptor loaded...')
      })
      .catch(err => console.error(err))
  }

  // form for capturing new events
  eventForm: FormGroup = this.formBuilder.group({
    hazard_type: new FormControl("", Validators.required),
    description: new FormControl("")
  });

  // capture new event
  captureEvent() {
    const eventFormData = this.eventForm.value;
    this.mapViewerService.captureEvent(eventFormData, this.photoList)
      .then(res => console.log(res))
      .catch(err => console.error(err))

    // reset event form and list of photos
    this.eventForm.reset()
    this.photoList = []
    this.photoListPreview = []

    this.toggleDrawerState()
  }

  // take photo for attachement
  async takePhoto() {
    const image = await Plugins.Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    this.photoList.push(image);
    this.photoListPreview.push(this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl)));
  }

  removePhoto(idx) {
    delete this.photoList[idx];
    delete this.photoListPreview[idx];
  }

  // show/hide drawer (bottom sheet)
  toggleDrawerState() {
    if (this.drawerState == DrawerState.Bottom)
      this.drawerState = DrawerState.Docked
    else
      this.drawerState = DrawerState.Bottom
  }

}