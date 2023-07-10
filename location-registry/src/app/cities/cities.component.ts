import { Component, OnInit, Input } from '@angular/core';
import { LocationService } from '../location.service';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.css']
})
export class CitiesComponent implements OnInit {
  @Input() selectedPinCode!: string;
  cities: any[] | undefined;

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.locationService.getCities(this.selectedPinCode).subscribe(
      (response) => {
        this.cities = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
