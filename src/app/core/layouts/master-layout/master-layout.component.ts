import { Component } from '@angular/core';
import { SidebarComponent } from '../../features/Shared/sidebar/sidebar.component';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from "../../features/Shared/nav-bar/nav-bar.component";

@Component({
  selector: 'app-master-layout',
  imports: [SidebarComponent, RouterOutlet, NavBarComponent, FooterComponent],
  templateUrl: './master-layout.component.html',
  styleUrl: './master-layout.component.css'
})
export class MasterLayoutComponent {
  /**
   *
   */
  constructor() {
  console.log("got to master");
    
  }

logout(){

}
}
