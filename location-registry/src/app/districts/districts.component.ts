import { Component, OnInit, Input } from '@angular/core';
import { LocationService } from '../location.service';

@Component({
  selector: 'app-districts',
  templateUrl: './districts.component.html',
  styleUrls: ['./districts.component.css']
})
export class DistrictsComponent implements OnInit {
  @Input() selectedStateId!: string;
  districts: any[] = [];

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.locationService.getDistricts(this.selectedStateId).subscribe(
      (response) => {
        this.districts = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
