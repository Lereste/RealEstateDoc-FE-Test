import {
  Component,
  Inject,
  Signal,
  signal,
  effect,
  computed,
  OnInit,
  DestroyRef,
  inject,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ProductService } from '../../../core/services/products.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { generateRandomId, getCurrentTimestamp } from '../../utils/helpers';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-product-dialog',
  templateUrl: './add-edit-product-dialog.component.html',
  styleUrls: ['./add-edit-product-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
  ],
})
export class AddEditProductDialogComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private _destroyRef = inject(DestroyRef);

  productForm!: FormGroup;
  categories = signal(['Smart Phone', 'Laptop', 'Tablet']);
  types = signal(['Gaming', 'Business', 'Casual']);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  imagePreview: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<AddEditProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private fb: FormBuilder,
    private productService: ProductService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.initializeForm();
    this.setupFormListeners();
  }

  private initializeForm(): void {
    const product = this.data?.product || {};
    this.isEditMode.set(!!this.data?.isEdit);
    this.imagePreview = product.image ?? null;

    this.productForm = this.fb.group({
      id: [product.id ?? generateRandomId()],
      name: [product.name ?? '', Validators.required],
      type: [product.type ?? '', Validators.required],
      category: [product.category ?? '', Validators.required],
      price: [product.price ?? 0, [Validators.required, Validators.min(1)]],
      image: [product.image ?? ''],
      isDeleted: [product.isDeleted ?? false],
      lastUpdated: [product.lastUpdated ?? getCurrentTimestamp()],
    });
  }

  private setupFormListeners(): void {
    this.productForm.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.updateLastUpdated());
  }

  private updateLastUpdated(): void {
    this.productForm.patchValue(
      { lastUpdated: getCurrentTimestamp() },
      { emitEvent: false }
    );
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.productForm.patchValue({ image: this.imagePreview });
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  
    const file = event.dataTransfer?.files[0] ?? null;
    if (file) {
      this.readImage(file);
    }
  }
  
  private readImage(file: File | null): void {
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.productForm.patchValue({ image: this.imagePreview });
    };
    reader.readAsDataURL(file);
  }
  

  saveProduct(): void {
    if (this.productForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const { id, ...productData } = this.productForm.value;
    const action$ = this.isEditMode()
      ? this.productService.updateProductById(id, productData)
      : this.productService.createNewProduct(this.productForm.value);

    action$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: (savedProduct) => {
        this.dialogRef.close(savedProduct);
        this.toastr.success(
          this.isEditMode() ? 'Product updated successfully!' : 'Product added successfully!',
          'Success'
        );
      },
      error: (err) => console.error('Error saving product:', err),
      complete: () => this.isSubmitting.set(false),
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
