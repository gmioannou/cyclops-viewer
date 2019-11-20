import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
})
export class EventFormComponent implements OnInit {
  
  constructor(private _formBuilder: FormBuilder) { }
  @Input() data;

  ngOnInit() {
    console.log("inside event form", this.data)
    this.hazardTypes = this.data
  }

  eventForm: FormGroup = this._formBuilder.group({
    HazardType: new FormControl("",Validators.required),
    Description: new FormControl("", Validators.required),
    status: new FormControl(""),
    priority: new FormControl(""),
    specialinstructions: new FormControl(""),
    attachments: new FormArray([]),
  });

  hazardTypes = []
  bindingData = {}

  customPopoverOptions: any = {
    header: 'Select Hazard Event Type'
  };

  test() {
    console.log("test", this.bindingData)
  }


  postEvent(event) {
    console.log(event);
    // this.drawerState = DrawerState.Bottom
  }
}
