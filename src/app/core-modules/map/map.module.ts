import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './components/map/map.component';
import { SharedModule } from "../../shared-modules/shared.module";
import {FormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    MapComponent
  ],
    imports: [
        CommonModule,
        MapRoutingModule,
        SharedModule,
        FormsModule
    ]
})
export class MapModule { }
