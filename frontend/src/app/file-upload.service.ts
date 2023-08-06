// file-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private http: HttpClient) {}

  uploadFile(file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<any>('/api/upload', formData);
  }
}
