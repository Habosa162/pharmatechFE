import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { SidebarComponent } from '../../features/Shared/sidebar/sidebar.component';
import { NavBarComponent } from '../../features/Shared/nav-bar/nav-bar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [NavBarComponent,RouterModule,FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
 constructor(private authService: AuthService, private router: Router) {
  //  console.log("got to admin");
   }
 Logout() {
     this.authService.logout();
     this.router.navigate(['/login']);
  }
}
