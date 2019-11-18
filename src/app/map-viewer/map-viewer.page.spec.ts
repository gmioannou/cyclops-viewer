import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapViewerPage } from './map-viewer.page';

describe('MapViewerPage', () => {
  let component: MapViewerPage;
  let fixture: ComponentFixture<MapViewerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapViewerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
