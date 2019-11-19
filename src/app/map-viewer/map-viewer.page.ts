import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { loadModules } from 'esri-loader';
import { ModelPageAddFeaturePage } from '../model-page-add-feature/model-page-add-feature.page';


@Component({
  selector: 'app-map-viewer',
  templateUrl: './map-viewer.page.html',
  styleUrls: ['./map-viewer.page.scss'],
})
export class MapViewerPage implements OnInit {
  @ViewChild("map", { static: false }) mapEl: ElementRef;

  mapView

  constructor(public platform: Platform, public modalController: ModalController) { }
  

  async presentModal(mapPoint) {
    const modal = await this.modalController.create({
      component: ModelPageAddFeaturePage,
      componentProps: {
        'data': mapPoint
      }
    });
    return await modal.present();
  }

  addToMap(event) {
    document.getElementById("map").style.cursor = "crosshair"
    let eventListen = this.mapView.on("click", (event) => {
      // remove the event when done
      eventListen.remove();
      // console.log("map point", event.mapPoint);
      document.getElementById("map").style.cursor = "default"

      // now 

      this.presentModal(event.mapPoint)
    });

  }

  ngOnInit() {
    this.getMap();
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
      url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Hazards_Uptown_Charlotte/FeatureServer/0",
      popupTemplate: popTemplate
    });

    let webmap = new WebMap({
      portalItem: {
        id: "6c5d657f1cb04a5eb78a450e3c699c2a"
      }
    });

    let map = new Map({
      basemap: 'osm',
      map: webmap
    });

    map.add(hazardsLayer);

    this.mapView = new MapView({
      container: this.mapEl.nativeElement,
      // center: [33, 35],
      // zoom: 8,
      map: map
    });



    // editor widget
    // var editorWidget = new Editor({
    //   view: mapView,
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

    // mapView.ui.add(editorWidget, "top-right");

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
    this.mapView.when(function() {
      locateWidget.locate()
    });

    // location tracker
    var track = new Track({
      view: this.mapView,
      useHeadingEnabled: true  // Change orientation of the map
      // graphic: new Graphic({
      //   symbol: {
      //     type: "simple-marker",
      //     size: "12px",
      //     color: "green",
      //     outline: {
      //       color: "#efefef",
      //       width: "1.5px"
      //     }
      //   }
      // }),
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

    // // basemap gallery
    // var basemapGallery = new BasemapGallery({
    //   view: mapView,
    //   source: {
    //     portal: {
    //       url: "https://www.arcgis.com",
    //       useVectorBasemaps: true  // Load vector tile basemaps
    //     }
    //   }
    // });

    // mapView.ui.add(basemapGallery, "bottom-left");

  }



}
