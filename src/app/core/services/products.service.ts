import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Product } from '../models/product.models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseURL = `${environment.baseUrl}`;

  private API_URL = `${this.baseURL}/products`;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL).pipe(
      map((products) => products.filter((product) => !product.isDeleted))
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  // search(query: string): Observable<Product[]> {
  //   const params = new HttpParams().set('q', query);
  //   return this.http.get<Product[]>(this.API_URL, { params });
  // }

  createNewProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product);
  }

  updateProductById(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/${id}`, product);
  }

  softDeleteMultiple(ids: number[]): Observable<Product[]> {
    if (ids.length === 0) return of([]);

    const deleteRequests = ids.map((id) =>
      this.http
        .patch<Product>(`${this.API_URL}/${id}`, { isDeleted: true })
        .pipe(
          catchError((err) => {
            console.error(`Error deleting product ${id}:`, err);
            return of(null as unknown as Product);
          })
        )
    );

    return forkJoin(deleteRequests).pipe(
      map((results) =>
        results.filter((product): product is Product => product !== null)
      )
    );
  }
  importProducts(products: Product[]): Observable<Product[]> {
    if (!Array.isArray(products) || products.length === 0) return of([]);

    const createRequests = products.map((product) =>
      this.http
        .post<Product>(this.API_URL, product)
        .pipe(catchError((err) => of(null as unknown as Product)))
    );

    return forkJoin(createRequests).pipe(
      map((results) =>
        results.filter((product): product is Product => product !== null)
      )
    );
  }
}
