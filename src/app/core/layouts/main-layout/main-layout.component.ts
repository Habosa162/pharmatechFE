import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { SidebarComponent } from '../../features/Shared/sidebar/sidebar.component';
import { NavBarComponent } from '../../features/Shared/nav-bar/nav-bar.component';

@Component({
  selector: 'app-main-layout',
  imports: [NavBarComponent,RouterModule,FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

}
