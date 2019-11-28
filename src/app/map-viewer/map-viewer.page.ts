import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonBottomDrawerModule, DrawerState } from 'ion-bottom-drawer';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Plugins, CameraResultType, CameraSource, Geolocation, GeolocationOptions } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MapViewerService } from '../services/map-viewer.service';
import { Platform } from '@ionic/angular';

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
  featureTypeSelected: any

  loading: boolean = false
  subscribe: any;

  constructor(
    private formBuilder: FormBuilder, 
    private sanitizer: DomSanitizer, 
    private mapViewerService: MapViewerService, 
    private platform: Platform) 
  {
    this.subscribe = this.platform.backButton.subscribeWithPriority(66666, () => {
      if (this.constructor.name == "MapViewerPage") {
        if (window.confirm("Are you sure you want to quit Cyclops Collector?")){
          navigator["app"].exitApp();
        }
      }  
    })
  }

  async ngOnInit() {

    // get mapview
    try {
      this.loading = true

      let res = await this.mapViewerService.getMapView()
      this.mapView = res
      this.mapView.container = this.mapEl.nativeElement
      console.log('Mapview initialized...');

      let laydesc = await this.mapViewerService.getFetureLayerDescriptor()
      let renderer = laydesc.data.drawingInfo.renderer
      this.featureLayerField = renderer.field1
      this.featureLayerDomain = renderer.uniqueValueInfos
      this.featureLayerDomain.forEach(element => {
        element.isSelected = false
      });
      
      console.log(this.featureLayerDomain)
      console.log('Layer descriptor initialized...');

    }
    catch (e) {
      console.log(e)
    }
    finally {
      this.loading = false
    }
  }

  // form for capturing new events
  eventForm: FormGroup = this.formBuilder.group({
    hazard_type: new FormControl(""),
    description: new FormControl("")
  });

  // update form control based on user selection
  selectFeatureType(featureType) {
    this.eventForm.controls['hazard_type'].setValue(featureType.value);
    this.featureLayerDomain.forEach(element => {
      if (element == featureType){
        element.isSelected = true
        this.featureTypeSelected = element
      }
      else element.isSelected = false
    });

  }

  // capture new event
  async captureEvent() {
    const eventFormData = this.eventForm.value;
    // console.log(eventFormData)

    try {
      this.loading = true

      await this.mapViewerService.captureEvent(eventFormData, this.photoList)
      
      // reset event form and list of photos
      this.eventForm.reset()
      this.photoList = []
      this.photoListPreview = []

      this.toggleDrawerState()

    }
    catch (e) {
      console.log(e)
    }
    finally {
      this.loading = false
    }

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
    this.photoList.splice(idx, 1);
    this.photoListPreview.splice(idx, 1);
  }

  // show/hide drawer (bottom sheet)
  toggleDrawerState() {
    if (this.drawerState == DrawerState.Bottom)
      this.drawerState = DrawerState.Docked
    else
      this.drawerState = DrawerState.Bottom
  }

}