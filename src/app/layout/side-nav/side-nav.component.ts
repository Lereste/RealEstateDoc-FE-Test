import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatListModule } from '@angular/material/list'; // Import MatListModule
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  imports: [MatListModule, MatIconModule, MatTooltipModule, NgIf] // Đảm bảo import đầy đủ
})
export class SideNavComponent {
  @Input() isCollapsed: boolean = false; // Nhận trạng thái collapsed từ parent component

  constructor(private router: Router) {}

  navigateTo(content: string) {
    this.router.navigateByUrl(`/home/${content}`);
  }
}
