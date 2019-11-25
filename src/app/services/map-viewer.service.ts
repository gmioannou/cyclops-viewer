import { Injectable } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Platform } from '@ionic/angular';
import { GeolocationOptions, Geolocation } from '@capacitor/core';
import axios from 'axios'
import formurlencoded from 'form-urlencoded';

// const featureLayerUrl = "https://celestia.cut.ac.cy/server/rest/services/Hosted/Session_Hazards/FeatureServer/0"
const featureLayerUrl_edit = "https://celestia.cut.ac.cy/server/rest/services/NaturalHazards/FeatureServer/0"
const featureLayerUrl = "https://celestia.cut.ac.cy/server/rest/services/NaturalHazards/MapServer/0"

@Injectable({
  providedIn: 'root'
})
export class MapViewerService {

  featureLayer: any

  constructor(public platform: Platform) { }

  getFetureLayerDescriptor() {
    let featureLayerDescriptor: any
    featureLayerDescriptor = axios.get(featureLayerUrl + "?f=json")

    return featureLayerDescriptor
  }

  async getMapView() {
    await this.platform.ready();

    //
    // Load the ArcGIS API for JavaScript modules
    //
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

    return new Promise((resolve, reject) => {

      var popTemplate = {
        title: "{hazard_type}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "hazard_type",
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

      let featureLayer = new FeatureLayer({
        url: featureLayerUrl,
        popupTemplate: popTemplate
      });

      this.featureLayer = featureLayer

      let map = new Map({
        basemap: 'osm',
        layers: [featureLayer]
      });

      let mapView = new MapView({
        center: [33.22861, 35.07287],
        zoom: 8,
        map: map
      });

      /*
       Add widgets to the mapview
        locateWidget
        trackWidget
        compassWidget
        basemapToggleWidget
        */

      var locateWidget = new Locate({
        view: mapView,
        useHeadingEnabled: true,
        goToOverride: function (view, options) {
          options.target.scale = 1500;  // Override the default map scale
          return view.goTo(options.target);
        }
      });
      mapView.ui.add(locateWidget, "top-left");

      var trackWidget = new Track({
        view: mapView,
        useHeadingEnabled: false,  // Change orientation of the map
        goToOverride: function (view, options) {
          options.target.scale = 1500;  // Override the default map scale
          return view.goTo(options.target);
        }
      });
      mapView.ui.add(trackWidget, "top-left");

      var compassWidget = new Compass({
        view: mapView
      });
      mapView.ui.add(compassWidget, "top-left");

      var basemapToggleWidget = new BasemapToggle({
        view: mapView,
        nextBasemap: "satellite"
      });
      mapView.ui.add(basemapToggleWidget, "bottom-left");

      // zoom to current location
      mapView.when(function () {
        locateWidget.locate();
      });

      resolve(mapView)
    })

  }


  // send the new hazard event to the backend for storage
  async captureEvent(eventFormData, photoList) {

    // get current device position
    const geolocationOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      requireAltitude: true
    }
    const devicePosition = await Geolocation.getCurrentPosition(geolocationOptions)

    // prepare the request
    let adds = [{
      "geometry": {
        "spatialReference": {
          wkid: 4326
        },
        "x": devicePosition.coords.longitude,
        "y": devicePosition.coords.latitude
      },
      "attributes": eventFormData
    }]
    let encodedStr = formurlencoded({ f: "json", adds: JSON.stringify(adds) })

    // execute the post request
    try {
      const res = await axios.post(featureLayerUrl_edit + "/applyEdits", encodedStr, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;'
        }
      })

      // get the objectID of the newly created feature to be used for the attachements
      let objectID = res.data.addResults[0].objectId

      if (photoList.length > 0) {

        photoList.map(async (photo) => {
          let img = this.dataURItoBlob(photo.dataUrl)
          const formData = new FormData();
          formData.append("f", "json")
          formData.append("attachment", new File([img], Date.now().toString() + ".png", { type: "image/png", lastModified: Date.now() }))

          const attachmentRes = await axios.post(featureLayerUrl_edit + '/' + objectID + "/addAttachment", formData, {
            headers: {
              'content-type': 'multipart/form-data'
            }
          })
        })
      }

      // refresh feature layer
      this.featureLayer.refresh()
      return objectID
      
    } catch (e) {
      console.log(e)
    }
  }

  delay(num)  {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("success")
      }, num)
    })
  }

  // convert the dataURI image format to binary
  dataURItoBlob(dataURI) {
    var byteStr;

    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteStr = atob(dataURI.split(',')[1]);
    else
      byteStr = unescape(dataURI.split(',')[1]);

    var mimeStr = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var arr = new Uint8Array(byteStr.length);
    for (var i = 0; i < byteStr.length; i++) {
      arr[i] = byteStr.charCodeAt(i);
    }

    return new Blob([arr], { type: mimeStr });
  }

}
