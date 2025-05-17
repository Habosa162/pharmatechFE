// sidebar.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  // Track collapsed states
  constructor(private authService:AuthService){}
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