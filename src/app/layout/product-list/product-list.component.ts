import {
  Component,
  ViewChild,
  Inject,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  signal,
  computed,
  PLATFORM_ID,
  Signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { ProductService } from '../../core/services/products.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEditProductDialogComponent } from '../../shared/components/add-edit-product-dialog/add-edit-product-dialog.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DebounceInputDirective } from '../../shared/directives/debounce-input.directive';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { compare } from '../../shared/utils/helpers';
import { ImagePreviewDialogComponent } from '../../shared/components/image-preview-dialog.component/image-preview-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product } from '../../core/models/product.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    FormsModule,
    MatSortModule,
    CommonModule,
    DebounceInputDirective,
    FormatDatePipe,
  ],
  standalone: true,
})
export class ProductListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private _destroyRef = inject(DestroyRef);

  private _productsSignal = signal<Product[]>([]);
  dataSource = new MatTableDataSource<Product>([]);

  pageSize = signal(5); // Default page size
  currentPage = signal(0); // Fist page

  private _filterText = signal('');
  filteredProducts = computed(() => {
    const searchText = this._filterText().toLowerCase();
    return this._productsSignal().filter((product) =>
      Object.values(product).join(' ').toLowerCase().includes(searchText)
    );
  });

  displayedColumns: string[] = [
    'no',
    'select',
    'id',
    'name',
    'type',
    'category',
    'price',
    'image',
    'lastUpdated',
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private productService: ProductService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this._loadProducts();
    this._restorePageSize();
    this._updateDataSource();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.dataSource.sort = this.sort;

      this.sort.sortChange
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this.currentPage.set(0); // Reset to first page when sorting
          this._updateDataSource();
        });

      this.cdr.detectChanges();
    }
  }

  // Computed signal for sorting the filtered products based on sort parameters
  private sortedProducts: Signal<Product[]> = computed(() => {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return this.filteredProducts();
    }

    const isAsc = this.sort.direction === 'asc';
    return [...this.filteredProducts()].sort((a, b) =>
      compare(
        a[this.sort.active as keyof Product],
        b[this.sort.active as keyof Product],
        isAsc
      )
    );
  });

  // Tải dữ liệu sản phẩm và lưu vào Signal
  private _loadProducts() {
    this.productService
      .getAllProducts()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((data: Product[]) => {
        // Filter out deleted products, add a 'selected' property, and sort by last updated time
        const filteredData = data
          .filter((product) => !product.isDeleted)
          .map((product) => ({ ...product, selected: false }))
          .sort(
            (a, b) =>
              new Date(b.lastUpdated).getTime() -
              new Date(a.lastUpdated).getTime()
          );
        this._productsSignal.set(filteredData);
        this._updateDataSource();
      });
  }

  // Update the MatTableDataSource with the paginated products
  private _updateDataSource() {
    this.dataSource.data = this._paginatedProducts();
    this.cdr.detectChanges();
  }

  // Event handler for filtering products when the user types in the search input
  onFilterChange(searchText: string) {
    this._filterText.set(searchText.toLowerCase());
    this.currentPage.set(0);
    this._updateDataSource();
  }

  refreshData(): void {
    this._loadProducts();
  }

  handleProductAction() {
    const selectedProducts = this.getSelectedProducts();
    if (selectedProducts.length === 1) {
      this.openEditProductDialog(selectedProducts[0]);
    } else {
      this.openAddProductDialog();
    }
  }

  openAddProductDialog() {
    const dialogRef = this.dialog.open(AddEditProductDialogComponent, {
      width: '800px',
      disableClose: true,
      data: { isEdit: false, product: {} },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((newProduct) => {
        if (newProduct) {
          this._productsSignal.update((products) => [
            ...products,
            { ...newProduct, selected: false },
          ]);
          this._updateDataSource();
        }
      });
  }

  openEditProductDialog(product: Product) {
    if (!product) return;

    const dialogRef = this.dialog.open(AddEditProductDialogComponent, {
      width: '800px',
      disableClose: true,
      data: { isEdit: true, product: { ...product } },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((updatedProduct) => {
        if (updatedProduct) {
          this._productsSignal.update((products) =>
            products.map((product) =>
              product.id === updatedProduct.id
                ? { ...updatedProduct, selected: product.selected }
                : product
            )
          );
          this._updateDataSource();
        }
      });
  }

  deleteSelectedProducts() {
    const selectedIds = this.getSelectedProducts().map((product) => product.id);
    if (selectedIds.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      // width: '600px',
      data: {
        message: `Do you want to delete ${selectedIds.length} product(s)?`,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.productService
          .softDeleteMultiple(selectedIds)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe(() => {
            this._productsSignal.update((products) =>
              products.filter((product) => !selectedIds.includes(product.id))
            );
            this._updateDataSource();
          });

        this.toastr.success(
          `Deleted ${selectedIds.length} product(s) successfully!`,
          'Success'
        );
      });
  }

  openImageDialog(imageUrl: string): void {
    this.dialog.open(ImagePreviewDialogComponent, {
      data: { imageUrl },
      panelClass: 'image-preview-dialog', // Custom panel class
    });
  }

  getSelectedProducts(): Product[] {
    return this._productsSignal().filter((product) => product.selected);
  }

  hasSingleSelectedProduct(): boolean {
    return this.getSelectedProducts().length === 1;
  }

  hasSelectedProducts(): boolean {
    return this._productsSignal().some((product) => product.selected);
  }

  hasSelectedProductsCount(): number {
    return this._productsSignal().filter((product) => product.selected).length;
  }

  isAllSelected(): boolean {
    return this._productsSignal().every((product) => product.selected);
  }

  isSomeSelected(): boolean {
    return (
      this._productsSignal().some((product) => product.selected) &&
      !this.isAllSelected()
    );
  }

  toggleAllSelection(event: any) {
    const isChecked = event.checked;
    this._productsSignal.update((products) =>
      products.map((product) => ({ ...product, selected: isChecked }))
    );
    this._updateDataSource();
  }

  private _restorePageSize() {
    if (isPlatformBrowser(this.platformId)) {
      const storedPageSize = localStorage.getItem('pageSize');
      if (storedPageSize) this.pageSize.set(+storedPageSize);
    }
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this._updateDataSource();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pageSize', event.pageSize.toString());
    }
  }

  private _paginatedProducts: Signal<Product[]> = computed(() => {
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.sortedProducts().slice(startIndex, endIndex);
  });

  // Đếm số sản phẩm đã chọn
  // Xuất dữ liệu ra file JSON
  exportData(): void {
    const products: Product[] = this.dataSource.data;
    const selectedProducts = products.filter((product) => product.selected);
    const productsToExport =
      selectedProducts.length > 0 ? selectedProducts : products;

    const jsonData = JSON.stringify(productsToExport, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    a.click();

    URL.revokeObjectURL(url);
  }

  // Nhập dữ liệu từ file JSON
  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!Array.isArray(data)) throw new Error('Invalid file format');

        // Gửi dữ liệu mới lên service
        this.productService.importProducts(data).subscribe(() => {
          this.snackBar.open('Import thành công!', 'OK', { duration: 3000 });
          this.refreshData();
        });
      } catch (error) {
        this.snackBar.open('Lỗi khi import file!', 'OK', { duration: 3000 });
      }
    };

    reader.readAsText(file);
    input.value = ''; // Reset file input
  }
}
