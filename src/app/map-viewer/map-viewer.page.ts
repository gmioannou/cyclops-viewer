import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { loadModules } from 'esri-loader';
import { IonBottomDrawerModule, DrawerState } from 'ion-bottom-drawer';
import formurlencoded from 'form-urlencoded';
import axios from 'axios'
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-map-viewer',
  templateUrl: './map-viewer.page.html',
  styleUrls: ['./map-viewer.page.scss'],
})

export class MapViewerPage implements OnInit {
  @ViewChild("map", { static: false }) mapEl: ElementRef;

  mapView: any
  drawerState = 0;
  dockedHeight = 400;
  items: File[] = [];
  mapPoint: any;
  hazardTypes: any = [];
  bindingData = {}
  hazardsLayer

  constructor(public platform: Platform, private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.getMap();
    this.listenerInputChange();
  }

  eventForm: FormGroup = this._formBuilder.group({
    HazardType: new FormControl("", Validators.required),
    Description: new FormControl("", Validators.required),
    status: new FormControl(""),
    priority: new FormControl(""),
    specialinstructions: new FormControl(""),
    attachments: new FormArray([]),
  });


  showEventForm(event) {
    this.drawerState = DrawerState.Docked
  }

  private captureEvent(event) {

    console.log("get location")
    document.getElementById("map").style.cursor = "crosshair"

    let eventListen = this.mapView.on("click", (event) => {

      // remove the event when done
      eventListen.remove();

      // console.log("map point", event.mapPoint);
      document.getElementById("map").style.cursor = "default"

      this.mapPoint = event.mapPoint

      this.addFeature()

      // hide bottom drawer
      this.drawerState = DrawerState.Bottom
    });

  }

  private listenerInputChange() {
    const wireUpFileChooser = () => {
      const elementRef = document.getElementById("filechooser")
      elementRef.addEventListener('change', (evt: any) => {
        const files = evt.target.files as File[];
        for (let i = 0; i < files.length; i++) {
          this.items.push(files[i]);
        }
      }, false);
    };
    wireUpFileChooser();
  }

  async addFeature() {

    console.log(this.mapPoint)
    console.log(this.bindingData)

    let adds = [{
      "geometry": {
        "spatialReference": {
          "latestWkid": 3857,
          "wkid": 102100
        },
        "x": this.mapPoint.x,
        "y": this.mapPoint.y
      },
      "attributes": this.bindingData
    }]

    let encodedStr = formurlencoded({ f: "json", adds: JSON.stringify(adds) })

    try {
      const res = await axios.post("https://celestia.cut.ac.cy/server/rest/services/Hosted/Session_Hazards/FeatureServer/0/applyEdits", encodedStr, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;'
        }
      })

      let objectID = res.data.addResults[0].objectId

      if (this.items.length > 0) {
        // there is a file to upload
        // make the request to 
        const formData = new FormData();
        formData.append("f", "json")
        formData.append("attachment", this.items[0])
        const attachmentRes = await axios.post("https://celestia.cut.ac.cy/server/rest/services/Hosted/Session_Hazards/FeatureServer/0/" + objectID + "/addAttachment", formData, {
          headers: {
            'content-type': 'multipart/form-data'
          }
        })

        console.log(attachmentRes.data)

      }

      this.hazardsLayer.refresh()

    } catch (e) {
      alert(e.message)
    }
  }

  async getMap() {

    await this.platform.ready();

    // Load the ArcGIS API for JavaScript modules
    const [Map, WebMap, MapView, Locate, Editor, FeatureLayer, Track, Graphic, Compass, BasemapToggle, BasemapGallery]: any = await loadModules([
      'esri/Map',
      'esri/WebMap',
      'esri/views/MapView',
      'esri/widgets/Locate',
      'esri/widgets/Editor',
      'esri/layers/FeatureLayer',
      'esri/widgets/Track',
      'esri/Graphic',
      'esri/widgets/Compass',
      'esri/widgets/BasemapToggle',
      'esri/widgets/BasemapGallery'
    ])
      .catch(err => {
        console.error('ArcGIS: ', err);
      });

    console.log('Initializing Map');

    var popTemplate = {
      title: "{hazardtype}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "hazardtype",
              label: "Hazard Type"
            },
            {
              fieldName: "description",
              label: "Description"
            },
            {
              fieldName: "status",
              label: "Status"
            },
            {
              fieldName: "priority",
              label: "Priority"
            }
          ]
        }
      ]
    };

    this.hazardsLayer = new FeatureLayer({
      url: "https://celestia.cut.ac.cy/server/rest/services/Hosted/Session_Hazards/FeatureServer/0",
      popupTemplate: popTemplate
    });

    let map = new Map({
      basemap: 'osm',
      layers: [this.hazardsLayer]
    });

    this.mapView = new MapView({
      container: this.mapEl.nativeElement,
      center: [33, 35],
      zoom: 8,
      map: map
    });

    // location widget
    var locateWidget = new Locate({
      view: this.mapView,
      useHeadingEnabled: true,
      goToOverride: function (view, options) {
        options.target.scale = 1500;  // Override the default map scale
        return view.goTo(options.target);
      }
    });

    this.mapView.ui.add(locateWidget, "top-left");

    // zoom to current location
    this.mapView.when(function () {
      locateWidget.locate()
    });


    // print out the coded domain values when the layer is loaded
    this.mapView.whenLayerView(this.hazardsLayer).then((layerView) => {

      layerView.watch("updating", (value) => {
        if (!value) {
          if (this.hazardTypes.length == 0)
            this.getFieldDomains()
        }
      });
      
    });


    // location tracker
    var track = new Track({
      view: this.mapView,
      useHeadingEnabled: true,  // Change orientation of the map
      graphic: new Graphic({
        symbol: {
          type: "simple-marker",
          size: "16px",
          color: "red",
          outline: {
            color: "#efefef",
            width: "1.5px"
          }
        }
      }),
    });
    this.mapView.ui.add(track, "top-left");


    // compass
    var compass = new Compass({
      view: this.mapView
    });
    this.mapView.ui.add(compass, "top-left");


    // basemap switcher
    var basemapToggle = new BasemapToggle({
      view: this.mapView,
      nextBasemap: "satellite"
    });
    this.mapView.ui.add(basemapToggle, "bottom-left");
  }

  // get field domains from the feature layer
  private getFieldDomains() {
    this.hazardsLayer.fields.forEach((field) => {

      let filedObj = { name: "", values: [] }
      
      if (field.domain) {
        var domain = field.domain
        filedObj.name = field.name

        if (domain.type === "coded-value") {
          domain.codedValues.forEach((codeValue) => {
            filedObj.values.push(
              {
                code: codeValue.code,
                description: codeValue.name
              }
            )
          });
        }
      }

      // check if valid domain 
      if (filedObj.name && filedObj.name != "" && filedObj.values.length > 0) {
        let found = this.hazardTypes.filter((o) => o.name == filedObj.name).length > 0
        
        if (!found) 
          this.hazardTypes.push(filedObj)
      }

    });
  }

}

    //editor widget
    // var editorWidget = new Editor({
    //   view: this.mapView,
    //   layerInfos: [{
    //     layer: this.hazardsLayer,
    //     fieldConfig: [
    //       {
    //         name: "hazardtype",
    //         label: "Hazard Type"
    //       },
    //       {
    //         name: "description",
    //         label: "Description"
    //       },
    //       {
    //         name: "status",
    //         label: "Status"
    //       },
    //       {
    //         name: "priority",
    //         label: "Priority"
    //       }          
    //     ],
    //     enabled: true,
    //     addEnabled: true,
    //     updateEnabled: true,
    //     deleteEnabled: true
    //   }]
    // });

    // this.mapView.ui.add(editorWidget, "top-right");