import { Component, OnInit, Input  } from '@angular/core';
import { ModalController } from '@ionic/angular';
import formurlencoded from 'form-urlencoded';
import { NavParams } from '@ionic/angular';
import axios from 'axios'

@Component({
  selector: 'app-model-page-add-feature',
  templateUrl: './model-page-add-feature.page.html',
  styleUrls: ['./model-page-add-feature.page.scss'],
})
export class ModelPageAddFeaturePage implements OnInit {

  @Input() data: any;


  items: File[] = [];

  constructor(navParams: NavParams, public modalController: ModalController) { }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  ngOnInit() {
    this.listenerInputChange();
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

    console.log(this.data)

    let adds = [{
         "geometry":{
            "spatialReference":{
               "latestWkid":3857,
               "wkid":102100
            },
            "x":this.data.x,
            "y":this.data.y
         },
         "attributes":{
            "Description":"hello world",
            "Status":"Active",
            "SpecialInstructions":"Contact Dispatch",
            "Priority":"High",
            "HazardType":"Flooding"
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

}
