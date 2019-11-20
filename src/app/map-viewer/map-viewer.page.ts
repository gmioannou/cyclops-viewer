import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { loadModules } from 'esri-loader';
import { IonBottomDrawerModule, DrawerState } from 'ion-bottom-drawer';
import { EventFormComponent } from '../event-form/event-form.component';
import formurlencoded from 'form-urlencoded';
import axios from 'axios'

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

  constructor(public platform: Platform) { }

  ngOnInit() {
    this.getMap();
    // this.listenerInputChange();
  }

  showEventForm(event){
    if (this.drawerState == DrawerState.Bottom) 
      this.drawerState = DrawerState.Docked;
    else
      this.drawerState = DrawerState.Bottom
  }

  addToMap(event) {
    this.drawerState = DrawerState.Docked;

    document.getElementById("map").style.cursor = "crosshair"

    let eventListen = this.mapView.on("click", (event) => {
      
      // remove the event when done
      eventListen.remove();

      // console.log("map point", event.mapPoint);
      document.getElementById("map").style.cursor = "default"

      this.mapPoint = event.mapPoint
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

    let adds = [{
         "geometry":{
            "spatialReference":{
               "latestWkid":3857,
               "wkid":102100
            },
            "x":this.mapPoint.x,
            "y":this.mapPoint.y
         },
         "attributes":{
            "description":"Added from Cyclops!",
            "status":"Active",
            "specialinstructions":"Contact Dispatch",
            "priority":"High",
            "hazardtype":"Flooding"
         }
      }]

      let encodedStr = formurlencoded({ f: "json", adds:  JSON.stringify(adds) })

      try {
        const res = await axios.post("https://celestia.cut.ac.cy/server/rest/services/Hosted/Session_Hazards/FeatureServer/0/applyEdits", encodedStr, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded;'
          }
        }) 
  
        let objectID = res.data.addResults[0].objectId

        if(this.items.length > 0) {
          // there is a file to upload
          // make the request to 
          const formData = new FormData();
          formData.append("f", "json")
          formData.append("attachment", this.items[0])
          const attachmentRes = await axios.post("https://celestia.cut.ac.cy/server/rest/services/Hosted/Session_Hazards/FeatureServer/0/"+ objectID +"/addAttachment", formData, {
            headers: {
              'content-type': 'multipart/form-data'
            }
          }) 

          console.log(attachmentRes.data)

        }
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

    console.log('Initializing ArcGIS Map');

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

    var hazardsLayer = new FeatureLayer({
      url: "https://celestia.cut.ac.cy/server/rest/services/Hosted/Session_Hazards/FeatureServer/0",
      popupTemplate: popTemplate
    });

    let map = new Map({
      basemap: 'osm',
      layers: [hazardsLayer]
    });

    this.mapView = new MapView({
      container: this.mapEl.nativeElement,
      center: [33, 35],
      zoom: 8,
      map: map
    });

    //editor widget
    // var editorWidget = new Editor({
    //   view: this.mapView,
    //   layerInfos: [{
    //     layer: hazardsLayer,
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
    this.mapView.whenLayerView(hazardsLayer).then((layerView) =>{

      layerView.watch("updating", (value)=> {
        if (!value) {
          
          hazardsLayer.fields.forEach((field) =>{
            
            let filedObj = { name : "", values: []}
            if (field.domain){
              var domain = field.domain
              console.log('\n\n', field.domain)
              console.log('\n', field.name, domain.type, domain.name);
              filedObj.name = field.name
              if (domain.type === "coded-value"){
                domain.codedValues.forEach((codeValue) =>{
                  console.log("name:", codeValue.name, "code:", codeValue.code);
                  filedObj.values.push(
                    {
                      code: codeValue.code,
                      description: codeValue.name
                    }
                  )
                });
              }
            }
            // check if valid 
            if(filedObj.name && filedObj.name != "" && filedObj.values.length > 0) {
              let found = this.hazardTypes.filter((o) => o.name == filedObj.name).length > 0
              if(!found) this.hazardTypes.push(filedObj)
            }
            
          });
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

    // adds the compass to the top left corner of the MapView
    this.mapView.ui.add(compass, "top-left");

    // basemap switcher
    var basemapToggle = new BasemapToggle({
      view: this.mapView,
      nextBasemap: "satellite"
    });

    this.mapView.ui.add(basemapToggle, "bottom-left");

  }



}
