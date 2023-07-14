import { Component } from '@angular/core';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      console.log(file);
    }
  }
}
