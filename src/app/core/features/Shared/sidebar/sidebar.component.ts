// sidebar.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule,RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  // Track collapsed states
  constructor(protected authService:AuthService){}
  menuStates = {
    mainMenu: true,
    managementMenu: true,
    reportsMenu: false,
    systemMenu: false
  };

  // toggleMenu(menu: string) {
  //   this.menuStates[menu] = !this.menuStates[menu];
  // }

  logout() {
    this.authService.logout() ;
  }
}
