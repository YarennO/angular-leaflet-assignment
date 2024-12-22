import {
  AfterViewInit,
  Component,
  OnInit,
  Renderer2,
  NgZone,
} from '@angular/core';
import * as L from 'leaflet';
import { SensorModel } from '../../models/SensorModel';
import { icon } from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  markers: L.Marker[] = [];
  selectedMarker: any = null;
  sensorModelList: SensorModel[] = [];
  searchText: string | null = null;

  constructor(private renderer: Renderer2, private zone: NgZone) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initMap();
    this.centerMap();
  }

  private initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    this.map = L.map('map').setView([39.9334, 32.8597], 6);

    L.tileLayer(baseMapURl).addTo(this.map);

    // 10 rastgele marker oluşturuluyor
    for (let i = 0; i < 10; i++) {
      const lat = 36 + Math.random() * 12;
      const lon = 26 + Math.random() * 20;
      const moisture = (Math.random() * 20).toFixed(2);
      const temperature = (Math.random() * 30).toFixed(2);
      const place = i.toString() + ' nolu kapı';

      const marker = L.marker([lat, lon], {
        // @ts-ignore
        customId: i,
        lon,
        moisture,
        temperature,
        place,
      }).addTo(this.map);

      var icon = L.icon({
        iconUrl: 'assets/images/map_pin.png',
        iconSize: [50, 85],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76],
      });

      marker.setIcon(icon);
      const popupContent = `
    
        <div>
          <h5>Nem ve Sıcaklık Sensörü</h5>
          <p>${place}</p>
        </div>

        <div>
             <img ngSrc="assets/images/temperature_icon.png" width="24" class="me-2" height="32" alt="temperature_icon"/>
             <h5>${temperature} °C</h5>
             <button class="custom-button" >
                <img ngSrc="${'assets/images/action_button.png'}" alt="Custom Icon" width="32"/>
             </button>
        </div>

      `;

      marker.bindPopup(popupContent).on('popupopen', () => {
        const button = document.getElementById(`detail-btn-${i}`);
        if (button) {
          this.renderer.listen(button, 'click', () => {
            this.handleButtonClick(lat, lon, moisture, temperature, i, place);
          });
        }
      });

      marker.on('click', () => {
        this.selectedMarker = { lat, lon, moisture, temperature, i, place };
        marker.openPopup();
      });

      this.markers.push(marker);
      this.initializeSensorModelData();
    }

    this.centerMap();
  }

  private centerMap() {
    const bounds = L.latLngBounds(
      this.markers.map((marker) => marker.getLatLng())
    );
    this.map.fitBounds(bounds);
  }

  handleButtonClick(
    lat: number,
    lon: number,
    moisture: string,
    temperature: string,
    index: number,
    place: string
  ) {
    this.selectedMarker = { lat, lon, moisture, temperature, index, place };
  }

  initializeSensorModelData() {
    if (!this.markers) {
      return;
    }

    this.sensorModelList = this.markers.map((marker, index) => ({
      //@ts-ignore
      id: marker.options?.customId,
      //@ts-ignore
      temperature: marker.options?.temperature || 0,
      //@ts-ignore
      moisture: marker.options?.moisture || 0,
      //@ts-ignore
      date: marker.options?.date || 0,
      //@ts-ignore
      place: marker.options?.place || '',
      //@ts-ignore
      battery: marker.options?.battery || 0,
      //@ts-ignore
      lat: marker.options?.lat || 0,
      //@ts-ignore
      lon: marker.options?.lon || 0,
    }));

  }

  getSelectedSensor(event: SensorModel) {
  

    //@ts-ignore
    this.selectedMarker = this.markers?.find(
      //@ts-ignore
      (marker) => marker.options?.id === event.id
    );
    const targetMarker = this.markers.find(
      (marker: any) => marker.options.customId === event.id
    );

    this.selectedMarker = targetMarker;


    if (targetMarker) {
      targetMarker.openPopup();
      this.map.setView(targetMarker.getLatLng());
    } else {
      console.warn(`Marker with id ${event.id} not found`);

      // @ts-ignore
      const lat = targetMarker?.lat;
      const lon = 26 + Math.random() * 20;
      const moisture = event?.moisture;
      const temperature = event?.temperature || 0;
      const i = event.id;

      const marker = L.marker([lat, lon], {
        // @ts-ignore
        customId: i,
      }).addTo(this.map);

      const popupContent = `
        <strong>Marker ${(i || 0) + 1}</strong><br>
        <strong>Nem:</strong> ${moisture} km/s<br>
        <strong>Sıcaklık:</strong> ${temperature}°C<br>
        <button id="detail-btn-${i}" class="detail-btn">Detayları Gör</button>
      `;

      marker.bindPopup(popupContent).on('popupopen', () => {
        const button = document.getElementById(`detail-btn-${i}`);
        if (button) {
          this.renderer.listen(button, 'click', () => {
            //@ts-ignore
            this.handleButtonClick(lat, lon, moisture, temperature, i || 0);
          });
        }
      });

      marker.on('click', () => {
        this.selectedMarker = { lat, lon, moisture, temperature, i };
        marker.openPopup();
      });

      this.markers.push(marker);
    }
  }

  get filteredSensors(): SensorModel[] {
    if (!this.searchText) {
      return this.sensorModelList;
    }

    const filtered = this.sensorModelList.filter((sensor) => {
      const place = sensor?.place?.toLowerCase();
      const search = this.searchText?.toLowerCase();

      return place?.includes(search!);
    });

    return filtered;
  }

  updateMarkers() {
    this.clearMarkers();

    this.filteredSensors.forEach((sensor) => {
      //@ts-ignore
      const marker = L.marker([sensor.lat, sensor.lon], {
        //@ts-ignore
        customId: sensor.id,
      }).addTo(this.map);

      const popupContent = `
        <strong>${sensor.place}</strong><br>
        <strong>Moisture:</strong> ${sensor.moisture} <br>
        <strong>Sıcaklık:</strong> ${sensor.temperature}°C<br>
        <button id="detail-btn-${sensor.id}" class="detail-btn">Detayları Gör</button>
      `;

      marker.bindPopup(popupContent).on('popupopen', () => {
        const button = document.getElementById(`detail-btn-${sensor.id}`);

        if (button) {
          this.renderer.listen(button, 'click', () => {
            this.handleButtonClick(
              //@ts-ignore
              sensor.lat,
              //@ts-ignore

              sensor.lon,
              //@ts-ignore
              sensor.moisture,
              sensor.temperature,
              sensor.id,
              sensor.place
            );
          });
        }
      });

      marker.on('click', () => {
        this.selectedMarker = sensor;
        marker.openPopup();
      });

      var greenIcon = L.icon({
        iconUrl: 'assets/images/map_pin.png',
        iconSize: [50, 85],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76],
      });

      marker.setIcon(greenIcon);

      this.markers.push(marker);
    });
  }

  private clearMarkers() {
    this.markers?.forEach((marker) => {
      this.map?.removeLayer(marker);
    });

    this.markers = [];
  }
}
