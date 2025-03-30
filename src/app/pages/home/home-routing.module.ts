import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home.component";
import { ProductListComponent } from "../../layout/product-list/product-list.component";
import { Content2Component } from "../../layout/content2/content2.component";


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'product-list', pathMatch: 'full' },
      { path: 'product-list', component: ProductListComponent },
      { path: 'sidenav-02', component: Content2Component },
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule { }


