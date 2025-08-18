import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/service/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  @Input() buttons: any[] = [];

  constructor(private router: Router, private authService:AuthService) { }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

}
