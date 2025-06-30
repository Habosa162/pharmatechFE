import { Component } from '@angular/core';
import { SidebarComponent } from '../../features/Shared/sidebar/sidebar.component';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { Router, RouterOutlet } from '@angular/router';
import { NavBarComponent } from "../../features/Shared/nav-bar/nav-bar.component";
import { AuthService } from '../../services/auth.service';

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
  constructor(private authService: AuthService, private router: Router) {
  console.log("got to master");

  }

Logout(){
  this.authService.logout();
  this.router.navigate(['/login']);

}
}
