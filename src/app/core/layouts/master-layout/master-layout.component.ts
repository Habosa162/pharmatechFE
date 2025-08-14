import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../features/Shared/sidebar/sidebar.component';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { Router, RouterOutlet } from '@angular/router';
import { NavBarComponent } from "../../features/Shared/nav-bar/nav-bar.component";
import { AuthService } from '../../services/auth.service';
import { AdminSidebarComponent } from "../../features/Shared/admin-sidebar/admin-sidebar.component";
import { AdminNavbarComponent } from "../../features/Shared/admin-navbar/admin-navbar.component";

@Component({
  selector: 'app-master-layout',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet, NavBarComponent, FooterComponent, AdminSidebarComponent, AdminNavbarComponent],
  templateUrl: './master-layout.component.html',
  styleUrl: './master-layout.component.css'
})
export class MasterLayoutComponent implements OnInit {
  
  constructor(private authService: AuthService, private router: Router) {
    console.log("got to master");
  }

  ngOnInit() {
    // Load user data when component initializes
    if (this.authService.isLoggedIn()) {
      this.authService.loadUserFullData();
    }
  }

  Logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
