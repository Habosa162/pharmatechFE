import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from '../../features/Shared/nav-bar/nav-bar.component';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [NavBarComponent, RouterOutlet, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Load user data when component initializes
    if (this.authService.isLoggedIn()) {
      this.authService.loadUserFullData();
    }
  }
}
