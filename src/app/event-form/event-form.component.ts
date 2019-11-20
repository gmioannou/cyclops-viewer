import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
})
export class EventFormComponent implements OnInit {
  
  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {}

  eventForm: FormGroup = this._formBuilder.group({
    HazardType: new FormControl("",Validators.required),
    Description: new FormControl("", Validators.required),
    status: new FormControl(""),
    priority: new FormControl(""),
    specialinstructions: new FormControl(""),
    attachments: new FormArray([]),
  });

  hazardTypes = [
    {
      'code':'1',
      'description': 'One'
    },
    {
      'code':'2',
      'description': 'Two'
    },
    {
      'code':'3',
      'description': 'Three'
    },
  ]

  customPopoverOptions: any = {
    header: 'Select Hazard Event Type'
  };

  postEvent(event) {
    console.log(event);
    // this.drawerState = DrawerState.Bottom
  }
}
