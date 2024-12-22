import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { SensorCardComponent } from './sensor-card/sensor-card.component';
import { NavbarComponent } from './components/navbar/navbar.component';



@NgModule({
  declarations: [
    SensorCardComponent,
    NavbarComponent
  ],
    imports: [
        CommonModule,
        NgOptimizedImage
    ],
  exports: [
    SensorCardComponent,
    NavbarComponent
  ]
})
export class SharedModule { }
