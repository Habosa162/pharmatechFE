import { Component } from '@angular/core';
import { SidebarComponent } from '../../features/Shared/sidebar/sidebar.component';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from "../../features/Shared/nav-bar/nav-bar.component";

@Component({
  selector: 'app-admin-layout',
  imports: [SidebarComponent, FooterComponent, RouterModule, NavBarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  /**
   *
   */
  constructor() {
  console.log("got to admin");
    
    
  }
logout()
{

}
}
