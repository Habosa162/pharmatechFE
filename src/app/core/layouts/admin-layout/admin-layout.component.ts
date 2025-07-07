import { Component } from '@angular/core';
import { SidebarComponent } from '../../features/Shared/sidebar/sidebar.component';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { Router, RouterModule } from '@angular/router';
import { NavBarComponent } from "../../features/Shared/nav-bar/nav-bar.component";
import { AuthService } from '../../services/auth.service';
import { AdminSidebarComponent } from "../../features/Shared/admin-sidebar/admin-sidebar.component";

@Component({
  selector: 'app-admin-layout',
  imports: [SidebarComponent, FooterComponent, RouterModule, NavBarComponent, AdminSidebarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  /**
   *
   */
  constructor(private authService: AuthService, private router: Router) {
  console.log("got to admin");


  }
Logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
 }
}
