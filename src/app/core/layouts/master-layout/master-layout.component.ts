import { Component } from '@angular/core';
import { SidebarComponent } from '../../features/Shared/sidebar/sidebar.component';
import { FooterComponent } from '../../features/Shared/footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-master-layout',
  imports: [SidebarComponent,RouterOutlet],
  templateUrl: './master-layout.component.html',
  styleUrl: './master-layout.component.css'
})
export class MasterLayoutComponent {

}
