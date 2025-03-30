import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { NgClass, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header.component';
import { SideNavComponent } from '../../layout/side-nav/side-nav.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    HeaderComponent,
    SideNavComponent,
    FooterComponent,
    RouterOutlet,
    MatSidenavContainer,
    MatSidenavContent,
    HeaderComponent,
    MatSidenav,
    NgClass
  ],
})
export class HomeComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isCollapsed: boolean = false;

  ngOnInit(): void {}

  toggleSidenav = () => {
    this.isCollapsed = !this.isCollapsed;
  };
  
}
