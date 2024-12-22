import { Component, EventEmitter, input, Output } from '@angular/core';
import { SensorModel } from '../../core-modules/map/models/SensorModel';

@Component({
  selector: 'app-sensor-card',
  standalone: false,

  templateUrl: './sensor-card.component.html',
  styleUrl: './sensor-card.component.scss',
})
export class SensorCardComponent {
  sensorData = input.required<SensorModel>();
  selectedSensorData = input<any>();
  @Output() selectedSensor: EventEmitter<SensorModel> =
    new EventEmitter<SensorModel>();

  setSelectedSensor(selectedSensor: SensorModel) {
    this.selectedSensor.emit(selectedSensor);
  }
}
