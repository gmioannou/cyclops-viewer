import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModelPageAddFeaturePage } from './model-page-add-feature.page';

describe('ModelPageAddFeaturePage', () => {
  let component: ModelPageAddFeaturePage;
  let fixture: ComponentFixture<ModelPageAddFeaturePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelPageAddFeaturePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModelPageAddFeaturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
