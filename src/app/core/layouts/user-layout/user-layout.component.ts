import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { NavBarComponent } from '../../features/Shared/nav-bar/nav-bar.component';
import { SidebarComponent } from '../../features/Shared/sidebar/sidebar.component';

@Component({
  selector: 'app-user-layout',
  imports: [SidebarComponent, FooterComponent, RouterModule, NavBarComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css'
})
export class UserLayoutComponent {
 constructor(private authService: AuthService, private router: Router) {
  console.log("got to admin");


  }
Logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
 }
}
