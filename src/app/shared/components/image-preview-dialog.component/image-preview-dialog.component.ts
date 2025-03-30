import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-preview-dialog',
  template: `
    <div class="image-preview-container">
      <img [src]="data.imageUrl" alt="Preview Image" />
    </div>
  `,
  styles: [`
    .image-preview-container {
      text-align: center;
    }
    .image-preview-container img {
      max-width: 100%;
      max-height: 80vh;
      border-radius: 8px;
      box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
    }
    .image-preview-dialog .mat-dialog-container {
  padding: 20px;
  background: white;
  border-radius: 12px;
}
  `]
})
export class ImagePreviewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ImagePreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }
  ) {}
}
