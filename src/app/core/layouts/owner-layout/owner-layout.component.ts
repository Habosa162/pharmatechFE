import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { NavBarComponent } from '../../features/Shared/nav-bar/nav-bar.component';
import { SidebarComponent } from '../../features/Shared/sidebar/sidebar.component';
import { AdminNavbarComponent } from "../../features/Shared/admin-navbar/admin-navbar.component";

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [SidebarComponent, FooterComponent, RouterModule, NavBarComponent, AdminNavbarComponent],
  templateUrl: './owner-layout.component.html',
  styleUrl: './owner-layout.component.css'
})
export class OwnerLayoutComponent {
constructor(private authService: AuthService, private router: Router) {
  console.log("got to admin");


  }
Logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
 }
}
